"use client";
import { UserContext } from "@/context/user";
import {
  CapsTSVResult,
  ENERGY_TYPE,
  TariffCategory,
  TariffType,
  gsp,
} from "@/data/source";
import useYearlyTariffQuery from "@/hooks/useYearlyTariffQuery";
import { evenRound } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import usePriceCapQuery from "./usePriceCapQuery";
import useConsumptionData from "./useConsumptionData";

export type IConsumptionCalculator = {
  deviceNumber: string;
  serialNo: string;
  tariff: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  results?: "monthly" | "yearly";
};

const useConsumptionCalculation = (inputs: IConsumptionCalculator) => {
  const { value } = useContext(UserContext);

  const {
    tariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
    results = "yearly",
  } = inputs;

  const fromISODate = new Date(fromDate).toISOString();
  const toISODate = new Date(toDate).toISOString();

  //get readings
  const {
    data: consumptionData,
    isSuccess,
    isLoading,
  } = useConsumptionData({
    fromISODate,
    toISODate,
    type,
    category,
    deviceNumber,
    serialNo,
    apiKey: value.apiKey,
  });

  const queryFnStandingChargeData = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${value.gsp}/standing-charges/?page_size=1500&period_from=${fromISODate}`
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const caps = usePriceCapQuery({ gsp: `_${value.gsp}` as gsp });

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
    fromDate: fromISODate,
    toDate: toISODate,
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
    queryKey: [
      "getStandingCharge",
      tariff,
      type,
      value.gsp,
      fromISODate,
      toISODate,
    ],
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

  if (isSuccess && consumptionData.results.length === 0) {
    return {
      cost: null,
      totalUnit: 0,
      totalPrice: 0,
      totalStandingCharge: 0,
      isLoading: false,
      lastDate: null,
      error:
        "Sorry, no consumption data available. Please try to select a different meter or try later.",
    };
  }

  if (
    isSuccess &&
    isRateDataSuccess &&
    isStandingChargeDataSuccess &&
    caps.data
  ) {
    if (results === "monthly") {
      const results = calculateMonthlyPrices(
        type,
        category,
        value.gasConversionFactor,
        fromISODate,
        toISODate,
        caps.data.filter((d) => d.Region === `_${value.gsp}`),
        consumptionData,
        flattenedRateData,
        standingChargeData
      );
      return results;
    } else {
      const results = calculatePrice(
        type,
        category,
        fromISODate,
        toISODate,
        value.gasConversionFactor,
        caps.data,
        consumptionData,
        flattenedRateData,
        standingChargeData
      );
      return results;
    }
  }
  return {
    cost: null,
    totalUnit: 0,
    totalPrice: 0,
    totalStandingCharge: 0,
    isLoading: isLoading || isRateDataLoading,
    lastDate: null,
    error: "",
  };
};

export default useConsumptionCalculation;

export const calculateMonthlyPrices = (
  type: Exclude<TariffType, "EG">,
  category: string,
  gasConversionFactor: number,
  fromDate: string,
  toDate: string,
  caps: CapsTSVResult[],
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
  let monthlyPricesInPound = [];
  let totalPrice = 0;
  let monthlyStandingCharge = 0;
  let totalStandingCharge = 0;
  let totalUnit = 0;
  let rateDataOffset = 0; // since there are GAPS in the consumption data (possibly due to consumption data not synced to the server), we need to check if the consumption data matches the following rate period with the offset
  let currentDay = 0;
  let currentMonth = new Intl.DateTimeFormat("en-GB", {
    year: "2-digit",
    month: "short",
  }).format(new Date(toDate));
  let currentRateIndex = 0;
  const consumptionMultiplier = type === "G" ? gasConversionFactor : 1;
  const filteredRateDataResults = rateData.results.filter(
    (d) => d.payment_method !== "NON_DIRECT_DEBIT"
  );

  const consumptionDataResults = consumptionData.results.filter(
    (d) =>
      new Date(d.interval_start) >= new Date(fromDate) &&
      new Date(d.interval_end) <= new Date(toDate)
  );

  for (let i = 0; i < consumptionDataResults.length; i++) {
    if (
      new Intl.DateTimeFormat("en-GB", {
        year: "2-digit",
        month: "short",
      }).format(new Date(consumptionDataResults[i].interval_start)) !==
      currentMonth
    ) {
      totalStandingCharge += monthlyStandingCharge;
      const monthlyCostPlusStandingChargeInPound: number =
        evenRound(totalPrice / 100, 2) +
        evenRound(totalStandingCharge / 100, 2) -
        monthlyPricesInPound.reduce((acc, cur) => {
          return acc + Object.values(cur)[0];
        }, 0);
      if (monthlyCostPlusStandingChargeInPound > 0) {
        monthlyPricesInPound.push({
          [currentMonth]: evenRound(monthlyCostPlusStandingChargeInPound, 2),
        });
      }
      currentMonth = new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
      }).format(new Date(consumptionDataResults[i].interval_start));
      monthlyStandingCharge = 0;
    }

    totalUnit += consumptionDataResults[i].consumption * consumptionMultiplier;

    if (category === "Fixed") {
      const currentPeriodTariff = filteredRateDataResults[0];
      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (category === "SVT") {
      const currentPeriodTariff = filteredRateDataResults.find(
        (d) =>
          new Date(d.valid_from) <=
            new Date(consumptionDataResults[i].interval_start) &&
          (d.valid_to === null ||
            new Date(d.valid_to) >=
              new Date(consumptionDataResults[i].interval_start))
      );

      const currentPeriodTariffCap = caps.find(
        (cap) =>
          new Date(consumptionDataResults[i].interval_start) >=
          new Date(cap.Date)
      );

      const currentUnitRate =
        (currentPeriodTariff?.value_inc_vat ?? 0) >
        Number(currentPeriodTariffCap?.[type] ?? 0)
          ? Number(currentPeriodTariffCap?.[type] ?? 0)
          : currentPeriodTariff?.value_inc_vat ?? 0;

      totalPrice +=
        currentUnitRate *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (
      category === "Go" ||
      category === "Cosy" ||
      category === "Flux"
    ) {
      for (let j = currentRateIndex; j < filteredRateDataResults.length; j++) {
        const currentRateEntry = filteredRateDataResults[j];
        if (
          new Date(currentRateEntry.valid_from) <=
            new Date(consumptionDataResults[i].interval_start) &&
          (filteredRateDataResults[j].valid_to === null ||
            new Date(currentRateEntry.valid_to) >=
              new Date(consumptionDataResults[i].interval_start))
        ) {
          totalPrice +=
            (currentRateEntry?.value_inc_vat ?? 0) *
            consumptionDataResults[i].consumption *
            consumptionMultiplier;
          break;
        }
        currentRateIndex++;
      }
    } else if (category === "Tracker") {
      // Agile or Tracker
      const currentResultStartDateTime = new Date(
        consumptionDataResults[i].interval_start
      );
      currentResultStartDateTime.setHours(0, 0, 0, 0);
      const currentResultStartDateTimestamp =
        currentResultStartDateTime.valueOf();
      const currentRateStartDateTime = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      );
      currentRateStartDateTime.setHours(0, 0, 0, 0);
      const currentRateStartDateTimestamp = currentRateStartDateTime.valueOf();
      /* check the same start time OR difference of 1 hour in daylight saving time */

      if (currentRateStartDateTimestamp === currentResultStartDateTimestamp) {
        totalPrice +=
          filteredRateDataResults[i + rateDataOffset].value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
        for (
          let j = 1;
          j < filteredRateDataResults.length - rateDataOffset;
          j++
        ) {
          const nextTime = new Date(
            filteredRateDataResults[i + rateDataOffset + j]?.valid_from
          );
          nextTime.setHours(0, 0, 0, 0);
          const nextTimestamp = nextTime.valueOf();

          if (nextTimestamp === currentResultStartDateTimestamp) {
            totalPrice +=
              filteredRateDataResults[i + rateDataOffset + j].value_inc_vat *
              consumptionDataResults[i].consumption *
              consumptionMultiplier;
            rateDataOffset += j;
            break;
          }
        }
      }
    } else if (category === "Agile") {
      // Agile
      const currentResultStartDateTimestamp = new Date(
        consumptionDataResults[i].interval_start
      ).valueOf();
      const currentRateStartDateTimestamp = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      ).valueOf();
      /* check the same start time OR difference of 1 hour in daylight saving time */

      if (
        currentRateStartDateTimestamp === currentResultStartDateTimestamp ||
        currentRateStartDateTimestamp ===
          currentResultStartDateTimestamp - 3600000
      ) {
        totalPrice +=
          filteredRateDataResults[i + rateDataOffset].value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
        for (let j = 1; j < filteredRateDataResults.length; j++) {
          const nextTimestamp = new Date(
            filteredRateDataResults[i + rateDataOffset + j]?.valid_from
          ).valueOf();

          if (
            nextTimestamp === currentResultStartDateTimestamp ||
            nextTimestamp === currentResultStartDateTimestamp - 3600000
          ) {
            totalPrice +=
              filteredRateDataResults[i + rateDataOffset + j].value_inc_vat *
              consumptionDataResults[i].consumption *
              consumptionMultiplier;
            rateDataOffset += j;
            break;
          }
        }
      }
    }

    if (
      new Date(consumptionDataResults[i].interval_start).setHours(
        0,
        0,
        0,
        0
      ) !== currentDay
    ) {
      currentDay = new Date(consumptionDataResults[i].interval_start).setHours(
        0,
        0,
        0,
        0
      );
      let standingCharge = 0;
      if (category === "Fixed") {
        standingCharge = standingChargeData.results[0]?.value_inc_vat ?? 0;
      } else {
        // for newer tariffs with starting date earlier than consumption date
        if (standingChargeData.results.length === 1) {
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
      }

      monthlyStandingCharge += standingCharge;
    }
  }

  totalStandingCharge += monthlyStandingCharge;
  const monthlyCostPlusStandingChargeInPound: number =
    evenRound(totalPrice / 100, 2) +
    evenRound(totalStandingCharge / 100, 2) -
    monthlyPricesInPound.reduce((acc, cur) => {
      return acc + Object.values(cur)[0];
    }, 0);
  monthlyPricesInPound.push({
    [currentMonth]: evenRound(monthlyCostPlusStandingChargeInPound, 2),
  });

  totalStandingCharge = evenRound(totalStandingCharge, 2);

  return {
    cost: monthlyPricesInPound,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading: false,
    lastDate: consumptionData?.results[0]?.interval_end ?? "",
    error: "",
  };
};

export const calculatePrice = (
  type: Exclude<TariffType, "EG">,
  category: string,
  fromDate: string,
  toDate: string,
  gasConversionFactor: number,
  caps: CapsTSVResult[],
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
  let totalUnit = 0;
  let totalStandingCharge = 0;
  let rateDataOffset = 0; // since there are GAPS in the consumption data (possibly due to consumption data not synced to the server), we need to check if the consumption data matches the following rate period with the offset
  let currentDay = 0;
  let currentRateIndex = 0;
  const consumptionMultiplier = type === "G" ? gasConversionFactor : 1;
  const filteredRateDataResults = rateData.results.filter(
    (d) => d.payment_method !== "NON_DIRECT_DEBIT"
  );

  const consumptionDataResults = consumptionData.results.filter(
    (d) =>
      new Date(d.interval_start) >= new Date(fromDate) &&
      new Date(d.interval_end) <= new Date(toDate)
  );

  for (let i = 0; i < consumptionDataResults.length; i++) {
    totalUnit += consumptionDataResults[i].consumption * consumptionMultiplier;

    if (category === "Fixed") {
      const currentPeriodTariff = filteredRateDataResults[0];
      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (category === "SVT") {
      const currentPeriodTariff = filteredRateDataResults.find(
        (d) =>
          new Date(d.valid_from) <=
            new Date(consumptionDataResults[i].interval_start) &&
          (d.valid_to === null ||
            new Date(d.valid_to) >=
              new Date(consumptionDataResults[i].interval_start))
      );
      const currentPeriodTariffCap = caps.find(
        (cap) =>
          new Date(consumptionDataResults[i].interval_start) >=
          new Date(cap.Date)
      );
      const currentUnitRate =
        (currentPeriodTariff?.value_inc_vat ?? 0) >
        Number(currentPeriodTariffCap?.[type] ?? 0)
          ? Number(currentPeriodTariffCap?.[type] ?? 0)
          : currentPeriodTariff?.value_inc_vat ?? 0;
      totalPrice +=
        currentUnitRate *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (
      category === "Go" ||
      category === "Cosy" ||
      category === "Flux"
    ) {
      for (let j = currentRateIndex; j < filteredRateDataResults.length; j++) {
        const currentRateEntry = filteredRateDataResults[j];
        if (
          new Date(currentRateEntry.valid_from) <=
            new Date(consumptionDataResults[i].interval_start) &&
          (filteredRateDataResults[j].valid_to === null ||
            new Date(currentRateEntry.valid_to)) >=
            new Date(consumptionDataResults[i].interval_start)
        ) {
          totalPrice +=
            (currentRateEntry?.value_inc_vat ?? 0) *
            consumptionDataResults[i].consumption *
            consumptionMultiplier;
          break;
        }
        currentRateIndex++;
      }
    } else if (category === "Tracker") {
      // Agile or Tracker
      const currentResultStartDateTime = new Date(
        consumptionDataResults[i].interval_start
      );
      currentResultStartDateTime.setHours(0, 0, 0, 0);
      const currentResultStartDateTimestamp =
        currentResultStartDateTime.valueOf();
      const currentRateStartDateTime = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      );
      currentRateStartDateTime.setHours(0, 0, 0, 0);
      const currentRateStartDateTimestamp = currentRateStartDateTime.valueOf();
      /* check the same start time OR difference of 1 hour in daylight saving time */

      if (currentRateStartDateTimestamp === currentResultStartDateTimestamp) {
        totalPrice +=
          filteredRateDataResults[i + rateDataOffset].value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
        for (
          let j = 1;
          j < filteredRateDataResults.length - rateDataOffset;
          j++
        ) {
          const nextTime = new Date(
            filteredRateDataResults[i + rateDataOffset + j]?.valid_from
          );
          nextTime.setHours(0, 0, 0, 0);
          const nextTimestamp = nextTime.valueOf();

          if (nextTimestamp === currentResultStartDateTimestamp) {
            totalPrice +=
              filteredRateDataResults[i + rateDataOffset + j].value_inc_vat *
              consumptionDataResults[i].consumption *
              consumptionMultiplier;
            rateDataOffset += j;
            break;
          }
        }
      }
    } else if (category === "Agile") {
      // Agile or Tracker
      const currentResultStartDateTimestamp = new Date(
        consumptionDataResults[i].interval_start
      ).valueOf();
      const currentRateStartDateTimestamp = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      ).valueOf();
      /* check the same start time OR difference of 1 hour in daylight saving time */

      if (
        currentRateStartDateTimestamp === currentResultStartDateTimestamp ||
        currentRateStartDateTimestamp ===
          currentResultStartDateTimestamp - 3600000
      ) {
        totalPrice +=
          filteredRateDataResults[i + rateDataOffset].value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
        for (let j = 1; j < filteredRateDataResults.length; j++) {
          const nextTimestamp = new Date(
            filteredRateDataResults[i + rateDataOffset + j]?.valid_from
          ).valueOf();

          if (
            nextTimestamp === currentResultStartDateTimestamp ||
            nextTimestamp === currentResultStartDateTimestamp - 3600000
          ) {
            totalPrice +=
              filteredRateDataResults[i + rateDataOffset + j].value_inc_vat *
              consumptionDataResults[i].consumption *
              consumptionMultiplier;
            rateDataOffset += j;
            break;
          }
        }
      }
    }

    if (
      new Date(consumptionDataResults[i].interval_start).setHours(
        0,
        0,
        0,
        0
      ) !== currentDay
    ) {
      currentDay = new Date(consumptionDataResults[i].interval_start).setHours(
        0,
        0,
        0,
        0
      );
      let standingCharge = 0;
      if (category === "Fixed") {
        standingCharge = standingChargeData.results[0]?.value_inc_vat ?? 0;
      } else {
        // for newer tariffs with starting date earlier than consumption date
        if (standingChargeData.results.length === 1) {
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
      }
      totalStandingCharge += standingCharge;
    }
  }

  // if consumption data is NOT enough for the whole year (mutliply by proportion)
  if (
    category === "Agile" ||
    category === "Go" ||
    category === "Cosy" ||
    category === "Flux"
  ) {
    if (consumptionDataResults.length < 365 * 48) {
      totalPrice = (totalPrice * 365 * 48) / consumptionDataResults.length;
      totalStandingCharge =
        (totalStandingCharge * 365 * 48) / consumptionDataResults.length;
    }
  } else {
    if (consumptionDataResults.length < 365) {
      totalPrice = (totalPrice * 365) / consumptionDataResults.length;
      totalStandingCharge =
        (totalStandingCharge * 365) / consumptionDataResults.length;
    }
  }
  totalPrice = evenRound(totalPrice / 100, 2);
  totalStandingCharge = evenRound(totalStandingCharge / 100, 2);

  return {
    cost: totalPrice + totalStandingCharge,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading: false,
    lastDate: null,
    error: "",
  };
};
