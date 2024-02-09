"use client";

import { TariffCategory, TariffType } from "@/data/source";

import { useMemo } from "react";
import { daysDiff, getDate } from "../utils/helpers";
import useYearlyTariffQuery from "./useYearlyTariffQuery";

function useTariffQueryAverage({
  tariff,
  type,
  gsp,
  fromDate,
  toDate,
  category,
  enabled = true,
  daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp?: string;
  fromDate: string;
  toDate: string;
  category: TariffCategory;
  enabled: boolean;
  daysOfWeek: number[];
}) {
  // avoid unnecessary refetching of consumption data if range is narrower
  const fromISODate = new Date(fromDate);
  const toISODate = new Date(toDate);

  const fromDataISODate = getDate(new Date(), "year", true).toISOString();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const toDataISODate = todayDate.toISOString();

  const { data, isLoading, isSuccess, isError } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff,
    type,
    gsp,
    fromDate: fromDataISODate,
    toDate: toDataISODate,
    category,
    enabled,
  });

  const dataByTime = useMemo(() => {
    const newDataByTime = Array.from({ length: 48 }).fill({
      count: 0,
      price: 0,
    }) as { count: number; price: number }[];

    if (isSuccess && data.length > 0) {
      const dataResults = data.flatMap((dataSet) => dataSet.results);
      dataResults.forEach((result) => {
        const currentIntervalStart = new Date(result.valid_from);
        const currentIntervalEnd =
          result.valid_to === null
            ? getDate(new Date(), "year", false)
            : new Date(result.valid_to);
        if (currentIntervalEnd.valueOf() <= fromISODate.valueOf()) return;
        if (currentIntervalStart.valueOf() >= toISODate.valueOf()) return;

        /* days of week cause difference */
        if (category === "Agile") {
          if (!daysOfWeek.includes(currentIntervalStart.getDay())) return;

          let sessionNumber = currentIntervalStart.getHours() * 2;
          if (currentIntervalStart.getMinutes() === 30) sessionNumber++;

          const { price: prevConsumption, count: prevCount } =
            newDataByTime[sessionNumber];
          newDataByTime[sessionNumber] = {
            price: prevConsumption + result.value_inc_vat,
            count: prevCount + 1,
          };
        }
        if (["Tracker"].includes(category)) {
          if (!daysOfWeek.includes(currentIntervalStart.getDay())) return;

          // same for the whole day
          newDataByTime.forEach((data, i) => {
            const { price: prevConsumption, count: prevCount } =
              newDataByTime[i];
            newDataByTime[i] = {
              price: prevConsumption + result.value_inc_vat,
              count: prevCount + 1,
            };
          });
        }

        if (["Cosy", "Go", "IGo", "Flux", "IFlux"].includes(category)) {
          const sessionStartIndex =
            currentIntervalStart.valueOf() <= fromISODate.valueOf()
              ? 0
              : Math.floor(
                  (currentIntervalStart.getHours() * 60 +
                    currentIntervalStart.getMinutes()) /
                    30
                );
          const sessionEndIndex =
            currentIntervalEnd.valueOf() >= toISODate.valueOf()
              ? 47
              : Math.floor(
                  (currentIntervalEnd.getHours() * 60 +
                    currentIntervalEnd.getMinutes() -
                    30) /
                    30
                );
          newDataByTime.forEach((data, i) => {
            if (
              (sessionEndIndex >= sessionStartIndex &&
                i <= sessionEndIndex &&
                i >= sessionStartIndex) ||
              (sessionEndIndex < sessionStartIndex &&
                (i >= sessionStartIndex || i <= sessionEndIndex))
            ) {
              const { price: prevConsumption, count: prevCount } =
                newDataByTime[i];
              newDataByTime[i] = {
                price: prevConsumption + result.value_inc_vat,
                count: prevCount + 1,
              };
            }
          });
        }

        /* days of week NO difference */
        /* use the latest value */
        if (["SVT", "Fixed"].includes(category)) {
          if (currentIntervalEnd.valueOf() <= toISODate.valueOf()) return;
          newDataByTime.forEach((data, i) => {
            const { price: prevConsumption, count: prevCount } =
              newDataByTime[i];
            newDataByTime[i] = {
              price: prevConsumption + result.value_inc_vat,
              count: prevCount + 1,
            };
          });
        }
      });
    }
    return newDataByTime;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tariff, type, gsp, fromDate, toDate, category, daysOfWeek]);

  if (isLoading) {
    return {
      isLoading: true,
      error: "",
    };
  }

  if (isSuccess && data.length > 0) {
    return {
      isLoading: false,
      error: "",
      dataByTime,
    };
  } else {
    return {
      isLoading: false,
      error:
        "Sorry, no consumption data available. Please try to select a different meter or try later.",
    };
  }
}

export default useTariffQueryAverage;
