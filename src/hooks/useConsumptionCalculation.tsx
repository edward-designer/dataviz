"use client";
import { UserContext } from "@/context/user";
import {
  CapsTSVResult,
  ENERGY_TYPE,
  TariffCategory,
  TariffType,
  gsp,
  trackerUnitPriceIncrease2023,
} from "@/data/source";
import useYearlyTariffQuery from "@/hooks/useYearlyTariffQuery";
import { evenRound, getDate } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import usePriceCapQuery from "./usePriceCapQuery";
import useConsumptionData from "./useConsumptionData";
import useTariffQueryYearlyAverage from "./useTariffQueryYearlyAverage";
import useTariffQueryAverage from "./useTariffQueryAverage";

export type IConsumptionCalculation = {
  deviceNumber: string;
  serialNo: string;
  tariff: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  results?: "monthly" | "yearly" | "daily";
  dual?: boolean;
};

const useConsumptionCalculation = (inputs: IConsumptionCalculation) => {
  const { value } = useContext(UserContext);

  const {
    tariff: inputTariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
    results = "yearly",
    dual = false,
  } = inputs;

  // avoid unnecessary refetching of consumption data if range is narrower
  const fromISODate = new Date(fromDate).toISOString();
  const toISODate = new Date(toDate).toISOString();

  const fromDataISODate = getDate(new Date(), "year", true).toISOString();
  const todayDate = new Date();
  todayDate.setUTCDate(todayDate.getUTCDate() - 1);
  if (todayDate.getTimezoneOffset() !== 0) {
    todayDate.setUTCHours(22, 59, 59, 0);
  } else {
    todayDate.setHours(23, 59, 59, 0);
  }

  const toDataISODate = todayDate.toISOString();

  //get readings
  const {
    data: consumptionData,
    isSuccess,
    isLoading,
  } = useConsumptionData({
    fromISODate: fromDataISODate,
    toISODate: toDataISODate,
    type,
    category,
    deviceNumber,
    serialNo,
    apiKey: value.apiKey,
    dual,
  });
  /* Important this should be removed when the new tariffs covers over 1/2 years */
  /*const tariff =
    inputTariff === "SILVER-23-12-06" && results === "yearly"
      ? "SILVER-FLEX-BB-23-02-08"
      : inputTariff === "AGILE-23-12-06" && results === "yearly"
      ? "AGILE-FLEX-22-11-25"
      : inputTariff;*/

  const tariff = inputTariff;

  const queryFnStandingChargeData = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${
          ENERGY_TYPE[type]
        }-tariffs/${type}-${dual ? "2" : "1"}R-${tariff}-${
          value.gsp
        }/standing-charges/?page_size=1500&period_from=${fromDataISODate}`
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };
  const currentGSP = `_${value.gsp}` as gsp;
  const caps = usePriceCapQuery({ gsp: currentGSP });

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
    fromDate: fromDataISODate,
    toDate: toDataISODate,
    category,
    enabled: !!deviceNumber && !!serialNo && !!category,
    dual,
  });

  const { dataByTime: averageRateByTime } = useTariffQueryAverage({
    tariff,
    type,
    gsp: value.gsp,
    fromDate,
    toDate,
    category,
    enabled: !!deviceNumber && !!serialNo && !!category,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
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
      fromDataISODate,
      toDataISODate,
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
      newTracker: true,
    };
  }

  if (
    isSuccess &&
    isRateDataSuccess &&
    isStandingChargeDataSuccess &&
    caps.data &&
    averageRateByTime
  ) {
    if (results === "daily") {
      const results = calculateDailyPrices(
        type,
        category,
        value.gasConversionFactor,
        fromISODate,
        toISODate,
        caps.data.filter((d) => d.Region === `_${value.gsp}`),
        consumptionData,
        flattenedRateData,
        standingChargeData,
        currentGSP,
        dual
      );
      return results;
    } else if (results === "monthly") {
      const results = calculateMonthlyPrices(
        type,
        category,
        value.gasConversionFactor,
        fromISODate,
        toISODate,
        caps.data.filter((d) => d.Region === `_${value.gsp}`),
        consumptionData,
        flattenedRateData,
        standingChargeData,
        currentGSP,
        dual
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
        averageRateByTime,
        standingChargeData,
        inputTariff === "SILVER-23-12-06",
        currentGSP,
        dual
      );
      return { ...results, newTracker: inputTariff === "SILVER-23-12-06" };
    }
  }
  return {
    cost: null,
    units: null,
    totalUnit: 0,
    totalPrice: 0,
    totalStandingCharge: 0,
    isLoading: isLoading || isRateDataLoading,
    lastDate: null,
    error: "",
  };
};

export default useConsumptionCalculation;

export const calculateDailyPrices = (
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
  },
  gsp: gsp,
  dual?: boolean
) => {
  let dailyPricesInPound = [];
  let dailyUnits = [];
  let monthUnit = 0;
  let totalPrice = 0;
  let dailyStandingCharge = 0;
  let totalStandingCharge = 0;
  let totalUnit = 0;
  let rateDataOffset = 0; // since there are GAPS in the consumption data (possibly due to consumption data not synced to the server), we need to check if the consumption data matches the following rate period with the offset
  let currentDay = 0;
  let currentPeriod = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
  }).format(new Date(toDate));
  let currentRateIndex = 0;
  const consumptionMultiplier = type === "G" ? gasConversionFactor : 1;
  const filteredRateDataResults = rateData.results.filter(
    (d) => d.payment_method !== "NON_DIRECT_DEBIT"
  );

  const consumptionDataResults = consumptionData.results.filter(
    (d) =>
      new Date(d.interval_start) >= new Date(fromDate) &&
      new Date(d.interval_start) <= new Date(toDate)
  );

  for (let i = 0; i < consumptionDataResults.length; i++) {
    if (
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
      }).format(new Date(consumptionDataResults[i].interval_start)) !==
      currentPeriod
    ) {
      totalStandingCharge += dailyStandingCharge;
      const dailyCostPlusStandingChargeInPound: number =
        evenRound(totalPrice / 100, 2) +
        evenRound(totalStandingCharge / 100, 2) -
        dailyPricesInPound.reduce((acc, cur) => {
          return acc + Object.values(cur)[0];
        }, 0);
      if (dailyCostPlusStandingChargeInPound > 0) {
        dailyPricesInPound.push({
          [currentPeriod]: evenRound(dailyCostPlusStandingChargeInPound, 2),
        });
        dailyUnits.push({
          [currentPeriod]: evenRound(monthUnit, 2),
        });
        monthUnit = 0;
      }
      currentPeriod = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
      }).format(new Date(consumptionDataResults[i].interval_start));
      dailyStandingCharge = 0;
    }

    totalUnit += consumptionDataResults[i].consumption * consumptionMultiplier;
    monthUnit += consumptionDataResults[i].consumption * consumptionMultiplier;

    if (category === "Fixed") {
      const currentPeriodTariff = filteredRateDataResults[0];
      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (category === "SVT") {
      if (dual) {
        const currentPeriodTariff = filteredRateDataResults.filter(
          (d) =>
            new Date(d.valid_from) <=
              new Date(consumptionDataResults[i].interval_start) &&
            (d.valid_to === null ||
              new Date(d.valid_to) >=
                new Date(consumptionDataResults[i].interval_start))
        );
        const peakTariff = currentPeriodTariff[0];
        const offpeakTariff = currentPeriodTariff[1];
        const startHour = new Date(
          consumptionDataResults[i].interval_start
        ).getHours();
        // 0 - 7 offpeak
        const currentRate = startHour < 7 ? offpeakTariff : peakTariff;

        totalPrice +=
          currentRate.value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
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
      }
    } else if (
      category === "IGo" ||
      category === "Go" ||
      category === "Cosy" ||
      category === "Flux" ||
      category === "IFlux"
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
      const currentResultStartDateTime = new Date(
        consumptionDataResults[i].interval_start
      );
      currentResultStartDateTime.setUTCHours(0, 0, 0, 0);
      const currentResultStartDateTimestamp =
        currentResultStartDateTime.valueOf();
      const currentRateStartDateTime = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      );
      currentRateStartDateTime.setUTCHours(0, 0, 0, 0);
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
          nextTime.setUTCHours(0, 0, 0, 0);
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

      dailyStandingCharge += standingCharge;
    }
  }

  totalStandingCharge += dailyStandingCharge;
  const dailyCostPlusStandingChargeInPound: number =
    evenRound(totalPrice / 100, 2) +
    evenRound(totalStandingCharge / 100, 2) -
    dailyPricesInPound.reduce((acc, cur) => {
      return acc + Object.values(cur)[0];
    }, 0);
  dailyPricesInPound.push({
    [currentPeriod]: evenRound(dailyCostPlusStandingChargeInPound, 2),
  });
  dailyUnits.push({
    [currentPeriod]: evenRound(monthUnit, 2),
  });
  totalStandingCharge = evenRound(totalStandingCharge, 2);

  dailyPricesInPound.reverse();

  return {
    cost: dailyPricesInPound,
    units: dailyUnits,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading: false,
    lastDate: consumptionData?.results[0]?.interval_end ?? "",
    error: "",
    newTracker: true,
  };
};

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
  },
  gsp: gsp,
  dual?: boolean
) => {
  let monthlyPricesInPound = [];
  let monthlyUnits = [];
  let monthUnit = 0;
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
        monthlyUnits.push({
          [currentMonth]: evenRound(monthUnit, 2),
        });
        monthUnit = 0;
      }
      currentMonth = new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
      }).format(new Date(consumptionDataResults[i].interval_start));
      monthlyStandingCharge = 0;
    }

    totalUnit += consumptionDataResults[i].consumption * consumptionMultiplier;
    monthUnit += consumptionDataResults[i].consumption * consumptionMultiplier;

    if (category === "Fixed") {
      const currentPeriodTariff = filteredRateDataResults[0];
      totalPrice +=
        (currentPeriodTariff?.value_inc_vat ?? 0) *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
    } else if (category === "SVT") {
      if (dual) {
        const currentPeriodTariff = filteredRateDataResults.filter(
          (d) =>
            new Date(d.valid_from) <=
              new Date(consumptionDataResults[i].interval_start) &&
            (d.valid_to === null ||
              new Date(d.valid_to) >=
                new Date(consumptionDataResults[i].interval_start))
        );
        const peakTariff = currentPeriodTariff[0];
        const offpeakTariff = currentPeriodTariff[1];
        const startHour = new Date(
          consumptionDataResults[i].interval_start
        ).getHours();
        // 0 - 7 offpeak
        const currentRate = startHour < 7 ? offpeakTariff : peakTariff;

        totalPrice +=
          currentRate.value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      } else {
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
      }
    } else if (
      category === "IGo" ||
      category === "Go" ||
      category === "Cosy" ||
      category === "Flux" ||
      category === "IFlux"
    ) {
      for (let j = currentRateIndex; j < filteredRateDataResults.length; j++) {
        const currentRateEntry = filteredRateDataResults[j];
        if (
          new Date(currentRateEntry.valid_from) <=
            new Date(consumptionDataResults[i].interval_start) &&
          (filteredRateDataResults[j].valid_to === null ||
            new Date(currentRateEntry.valid_to).valueOf() >=
              new Date(consumptionDataResults[i].interval_start).valueOf() -
                3600000)
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
      const currentResultStartDateTime = new Date(
        consumptionDataResults[i].interval_start
      );
      currentResultStartDateTime.setUTCHours(0, 0, 0, 0);
      const currentResultStartDateTimestamp =
        currentResultStartDateTime.valueOf();
      const currentRateStartDateTime = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      );
      currentRateStartDateTime.setUTCHours(0, 0, 0, 0);
      const currentRateStartDateTimestamp = currentRateStartDateTime.valueOf();

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
  monthlyUnits.push({
    [currentMonth]: evenRound(monthUnit, 2),
  });
  totalStandingCharge = evenRound(totalStandingCharge, 2);

  return {
    cost: monthlyPricesInPound,
    units: monthlyUnits,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading: false,
    lastDate: consumptionData?.results[0]?.interval_end ?? "",
    error: "",
    newTracker: true,
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
  averageRateData: number[],
  standingChargeData: {
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: null | string;
      payment_method: null | string;
    }[];
  },
  isNewTracker: boolean,
  gsp: gsp,
  dual?: boolean
) => {
  const audit: {
    date: string | undefined;
    rate: number | undefined;
    cost: number;
  }[] = [];
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

  const nextOfEndDate = new Date(toDate);
  nextOfEndDate.setDate(nextOfEndDate.getDate() + 1);
  nextOfEndDate.setHours(0, 0, 0, 0);

  const consumptionDataResults = consumptionData.results.filter(
    (d) =>
      new Date(d.interval_start) >= new Date(fromDate) &&
      new Date(d.interval_end) <= nextOfEndDate
  );

  for (let i = 0; i < consumptionDataResults.length; i++) {
    totalUnit += consumptionDataResults[i].consumption * consumptionMultiplier;

    if (category === "Fixed") {
      const currentRateEntry = filteredRateDataResults[0];
      totalPrice +=
        (currentRateEntry?.value_inc_vat ?? 0) *
        consumptionDataResults[i].consumption *
        consumptionMultiplier;
      audit.push({
        date: currentRateEntry?.valid_from,
        rate: currentRateEntry?.value_inc_vat,
        cost:
          (currentRateEntry?.value_inc_vat ?? 0) *
          consumptionDataResults[i].consumption *
          consumptionMultiplier,
      });
    } else if (category === "SVT") {
      if (dual) {
        const currentPeriodTariff = filteredRateDataResults.filter(
          (d) =>
            new Date(d.valid_from) <=
              new Date(consumptionDataResults[i].interval_start) &&
            (d.valid_to === null ||
              new Date(d.valid_to) >=
                new Date(consumptionDataResults[i].interval_start))
        );
        const peakTariff = currentPeriodTariff[0];
        const offpeakTariff = currentPeriodTariff[1];
        const startHour = new Date(
          consumptionDataResults[i].interval_start
        ).getHours();
        // 0 - 7 offpeak
        const currentRateEntry = startHour < 7 ? offpeakTariff : peakTariff;

        totalPrice +=
          currentRateEntry.value_inc_vat *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
        audit.push({
          date: currentRateEntry?.valid_from,
          rate: currentRateEntry?.value_inc_vat,
          cost:
            (currentRateEntry?.value_inc_vat ?? 0) *
            consumptionDataResults[i].consumption *
            consumptionMultiplier,
        });
      } else {
        const currentRateEntry = filteredRateDataResults.find(
          (d) =>
            new Date(d.valid_from) <=
              new Date(consumptionDataResults[i].interval_start) &&
            (d.valid_to === null ||
              new Date(d.valid_to) >=
                new Date(consumptionDataResults[i].interval_start))
        );
        const currentRateEntryCap = caps.find(
          (cap) =>
            new Date(consumptionDataResults[i].interval_start) >=
            new Date(cap.Date)
        );
        const currentUnitRate =
          (currentRateEntry?.value_inc_vat ?? 0) >
          Number(currentRateEntryCap?.[type] ?? 0)
            ? Number(currentRateEntryCap?.[type] ?? 0)
            : currentRateEntry?.value_inc_vat ?? 0;
        totalPrice +=
          currentUnitRate *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
        audit.push({
          date: currentRateEntry?.valid_from,
          rate: currentRateEntry?.value_inc_vat,
          cost:
            (currentRateEntry?.value_inc_vat ?? 0) *
            consumptionDataResults[i].consumption *
            consumptionMultiplier,
        });
      }
    } else if (
      category === "IGo" ||
      category === "Go" ||
      category === "Cosy" ||
      category === "Flux" ||
      category === "IFlux"
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
          audit.push({
            date: currentRateEntry.valid_from,
            rate: currentRateEntry?.value_inc_vat,
            cost:
              (currentRateEntry?.value_inc_vat ?? 0) *
              consumptionDataResults[i].consumption *
              consumptionMultiplier,
          });
          break;
        }
        currentRateIndex++;
      }
    } else if (category === "Tracker") {
      // Tracker
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
        totalPrice +=
          averageRateData[0] *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      }

      audit.push({
        date:
          filteredRateDataResults[i + rateDataOffset]?.valid_from ?? "average",
        rate:
          filteredRateDataResults[i + rateDataOffset]?.value_inc_vat ??
          averageRateData[0],
        cost:
          (filteredRateDataResults[i + rateDataOffset]?.value_inc_vat ??
            averageRateData[0]) *
          consumptionDataResults[i].consumption *
          consumptionMultiplier,
      });
    } else if (category === "Agile") {
      // Agile
      const currentResultStartDateTimestamp = new Date(
        consumptionDataResults[i].interval_start
      ).valueOf();
      const currentRateStartDateTimestamp = new Date(
        filteredRateDataResults[i + rateDataOffset]?.valid_from
      ).valueOf();

      const curreentDayStart = new Date(
        consumptionDataResults[i].interval_start
      );
      curreentDayStart.setHours(0, 0, 0, 0);
      const currentTimeSlot = Math.floor(
        ((currentResultStartDateTimestamp - curreentDayStart.valueOf()) * 2) /
          (1000 * 60 * 60)
      );

      /* check the same start time OR difference of 1 hour in daylight saving time */
      if (filteredRateDataResults[i + rateDataOffset]?.value_inc_vat) {
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
      } else {
        // day light saving would cause the timeslot to be 49,48 around 63??
        totalPrice +=
          (averageRateData[currentTimeSlot] ?? 0) *
          consumptionDataResults[i].consumption *
          consumptionMultiplier;
      }
      audit.push({
        date:
          filteredRateDataResults[i + rateDataOffset]?.valid_from ?? "average",
        rate:
          filteredRateDataResults[i + rateDataOffset]?.value_inc_vat ??
          averageRateData[currentTimeSlot],
        cost:
          (filteredRateDataResults[i + rateDataOffset]?.value_inc_vat ??
            averageRateData[currentTimeSlot] ??
            0) *
          consumptionDataResults[i].consumption *
          consumptionMultiplier,
      });
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
  const periodLength = Math.ceil(
    (new Date(toDate).valueOf() - new Date(fromDate).valueOf()) /
      (24 * 60 * 60 * 1000)
  );
  if (
    category === "Agile" ||
    category === "Go" ||
    category === "IGo" ||
    category === "Cosy" ||
    category === "Flux" ||
    category === "IFlux"
  ) {
    if (audit.length < periodLength * 48) {
      totalPrice = (totalPrice * periodLength * 48) / audit.length;
      totalStandingCharge =
        (totalStandingCharge * periodLength * 48) / audit.length;
    }
  } else {
    if (audit.length < periodLength) {
      totalPrice = (totalPrice * periodLength) / audit.length;
      totalStandingCharge = (totalStandingCharge * periodLength) / audit.length;
    }
  }

  totalPrice = evenRound(totalPrice / 100, 2);
  totalStandingCharge = evenRound(totalStandingCharge / 100, 2);
  // formula to reflect 2023Dec change to Agile/Tracker if not currently on Agile/Tracker

  /* if (category === "Agile") {
    // average standing charge increase E 14%, G 3%
    type === "E"
      ? (totalStandingCharge *= 1.15)
      : (totalStandingCharge *= 1.03);
  }

  if (isNewTracker) {
    // average standing charge increase E 14%, G 3%
    type === "E"
      ? (totalStandingCharge *= 1.15)
      : (totalStandingCharge *= 1.03);
    // average unit rate increase E 11%, G 3%
    totalPrice = evenRound(
      totalPrice + (trackerUnitPriceIncrease2023[gsp][type] * totalUnit) / 100,
      2
    );
  }
  */

  return {
    cost: totalPrice + totalStandingCharge,
    units: null,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading: false,
    lastDate: null,
    error: "",
  };
};
