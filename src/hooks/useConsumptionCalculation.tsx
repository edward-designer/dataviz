"use client";
import { memo, useContext, useState } from "react";
import { UserContext } from "@/context/user";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import { evenRound } from "@/utils/helpers";
import useYearlyTariffQuery from "@/hooks/useYearlyTariffQuery";
import {
  ENERGY_TYPE,
  GAS_MULTIPLIER_TO_KWH,
  TariffCategory,
  TariffType,
} from "@/data/source";

export type IConsumptionCalculator = {
  deviceNumber: string;
  serialNo: string;
  tariff: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
};

const useConsumptionCalculation = (inputs: IConsumptionCalculator) => {
  const { value } = useContext(UserContext);

  const { tariff, fromDate, toDate, type, category, deviceNumber, serialNo } =
    inputs;

  const groupBy = {
    Agile: "",
    Go: "",
    Cosy: "",
    Tracker: "&group_by=day",
    SVT: "&group_by=day",
    Fixed: "&group_by=day",
  };

  //get readings
  const queryFn = async () => {
    try {
      // page_size 25000 is a year's data
      const response = await fetch(
        `https://api.octopus.energy/v1/${ENERGY_TYPE[type]}-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromDate}&period_to=${toDate}&page_size=25000${groupBy[category]}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(value.apiKey)}`,
          },
        }
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const queryFnStandingChargeData = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${value.gsp}/standing-charges/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const {
    data: consumptionData,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: [
      deviceNumber,
      serialNo,
      new Date().toLocaleDateString(),
      category,
    ],
    queryFn,
    enabled: !!deviceNumber && !!serialNo && !!category,
  });

  const {
    data: rateData,
    isSuccess: isRateDataSuccess,
    isLoading: isRateDataLoading,
  } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff,
    type,
    gsp: value.gsp,
    fromDate,
    toDate,
    category,
    enabled: !!deviceNumber && !!serialNo && !!category,
  });

  const {
    data: standingChargeData,
    isSuccess: isStandingChargeDataSuccess,
    isLoading: isStandingChargeDataLoading,
  } = useQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: null | string;
      payment_method: null | string;
    }[];
  }>({
    queryKey: ["getStandingCharge", tariff, type, value.gsp],
    queryFn: queryFnStandingChargeData,
    enabled: !!value.gsp && !!deviceNumber && !!serialNo && !!category,
  });

  const flattenedRateData = {
    results:
      rateData?.reduce(
        (
          acc: {
            value_inc_vat: number;
            valid_from: string;
            valid_to: string;
            payment_method: null | string;
          }[],
          monthlyRateData
        ) => {
          return [...acc, ...monthlyRateData.results];
        },
        []
      ) ?? [],
  };

  if (isSuccess && isRateDataSuccess && isStandingChargeDataSuccess) {
    const calculatedCost = calculatePrice(
      type,
      category,
      consumptionData,
      flattenedRateData,
      standingChargeData
    );
    return { cost: calculatedCost };
  }
  return { cost: null };
};

export default useConsumptionCalculation;

export const calculatePrice = (
  type: Exclude<TariffType, "EG">,
  category: string,
  consumptionData: {
    results: {
      consumption: number;
      interval_start: string;
      interval_end: string;
    }[];
  },
  rateData: {
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  },
  standingChargeData: {
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: null | string;
      payment_method: null | string;
    }[];
  }
) => {
  let totalPrice = 0;
  let rateDataOffset = 0; // since there are GAPS in the consumption data (possibly due to consumption data not synced to the server), we need to check if the consumption data matches the following rate period with the offset
  let currentDay = 0;
  let currentRateIndex = 0;
  const consumptionMultiplier = type === "G" ? GAS_MULTIPLIER_TO_KWH : 1;
  const filteredRateDataResults = rateData.results.filter(
    (d) => d.payment_method !== "NON_DIRECT_DEBIT"
  );

  for (let i = 0; i < consumptionData.results.length; i++) {
    if (category === "Fixed") {
      const currentPeriodTariff = filteredRateDataResults[0];
      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionData.results[i].consumption *
        consumptionMultiplier;
    } else if (category === "SVT") {
      const currentPeriodTariff = filteredRateDataResults.find(
        (d) =>
          new Date(d.valid_from) <=
            new Date(consumptionData.results[i].interval_start) &&
          (d.valid_to === null || new Date(d.valid_to)) >=
            new Date(consumptionData.results[i].interval_start)
      );

      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionData.results[i].consumption *
        consumptionMultiplier;
    } else if (category === "Go" || category === "Cosy") {
      for (let j = currentRateIndex; j < filteredRateDataResults.length; j++) {
        const currentRateEntry = filteredRateDataResults[j];
        if (
          new Date(currentRateEntry.valid_from) <=
            new Date(consumptionData.results[i].interval_start) &&
          (filteredRateDataResults[j].valid_to === null ||
            new Date(currentRateEntry.valid_to)) >=
            new Date(consumptionData.results[i].interval_start)
        ) {
          totalPrice +=
            (currentRateEntry?.value_inc_vat ?? 0) *
            consumptionData.results[i].consumption *
            consumptionMultiplier;
          break;
        }
        currentRateIndex++;
      }
    } else {
      if (
        new Date(
          filteredRateDataResults[i + rateDataOffset]?.valid_from
        ).valueOf() ===
        new Date(consumptionData.results[i].interval_start).valueOf()
      ) {
        totalPrice +=
          filteredRateDataResults[i + rateDataOffset].value_inc_vat *
          consumptionData.results[i].consumption *
          consumptionMultiplier;
      } else {
        for (let j = 1; j < consumptionData.results.length; j++) {
          if (
            new Date(
              filteredRateDataResults[i + rateDataOffset + j]?.valid_from
            ).valueOf() ===
            new Date(consumptionData.results[i].interval_start).valueOf()
          ) {
            totalPrice +=
              filteredRateDataResults[i + rateDataOffset + j].value_inc_vat *
              consumptionData.results[i].consumption *
              consumptionMultiplier;
            rateDataOffset += j;
            break;
          }
        }
      }
    }

    if (
      new Date(consumptionData.results[i].interval_start).setHours(
        0,
        0,
        0,
        0
      ) !== currentDay
    ) {
      currentDay = new Date(consumptionData.results[i].interval_start).setHours(
        0,
        0,
        0,
        0
      );
      let standingCharge = 0;
      if (category === "Fixed") {
        standingCharge = standingChargeData.results[0]?.value_inc_vat ?? 0;
      } else {
        standingCharge =
          standingChargeData.results
            .filter((d) => d.payment_method !== "NON_DIRECT_DEBIT")
            .find(
              (d) =>
                new Date(d.valid_from) <= new Date(currentDay) &&
                (d.valid_to === null ||
                  new Date(d.valid_to) >= new Date(currentDay))
            )?.value_inc_vat ?? 0;
      }
      totalPrice += standingCharge;
    }
  }

  // if consumption data is NOT enough for the whole year (mutliply by proportion)
  if (category === "Agile") {
    if (consumptionData.results.length < 365 * 48) {
      totalPrice = (totalPrice * 365 * 48) / consumptionData.results.length;
    }
  } else {
    if (consumptionData.results.length < 365) {
      totalPrice = (totalPrice * 365) / consumptionData.results.length;
    }
  }
  totalPrice = evenRound(totalPrice / 100, 2);
  return totalPrice;
};
