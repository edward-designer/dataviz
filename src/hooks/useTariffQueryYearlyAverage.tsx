"use client";

import {
  TariffCategory,
  TariffType,
  gsp,
  trackerUnitPriceIncrease2023,
} from "@/data/source";

import { useContext, useMemo } from "react";
import { getDate, getUnderlyingTariff } from "../utils/helpers";
import useYearlyTariffQuery from "./useYearlyTariffQuery";
import { UserContext } from "@/context/user";

export interface ISimTariffData {
  count: number;
  price: number;
}

const useTariffQueryYearlyAverage = ({
  tariff,
  type,
  fromDate,
  toDate,
  category,
  enabled = true,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  fromDate: string;
  toDate: string;
  category: TariffCategory;
  enabled?: boolean;
}) => {
  const { value } = useContext(UserContext);

  const fromISODate = new Date(fromDate);
  const toISODate = new Date(toDate);

  const endOfLastMonth = new Date();
  endOfLastMonth.setHours(0, 0, 0, 0);
  endOfLastMonth.setDate(1);
  const firstOfMonthAYearEarlier = getDate(endOfLastMonth, "year", true);

  const toDataISODate = endOfLastMonth.toISOString();
  const fromDataISODate = firstOfMonthAYearEarlier.toISOString();

  /* getUnderlyingTariff switch the tariff to prev version to get over a year's data for Agile & Tracker, but need to check if the tariff is still updated */
  const { data, isLoading, isSuccess, isError } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff: getUnderlyingTariff(tariff),
    type,
    gsp: value.gsp,
    fromDate: fromDataISODate,
    toDate: toDataISODate,
    category,
    enabled,
  });

  const dataByTimeYearly = useMemo(() => {
    const newDataByTime = Array.from({ length: 12 })
      .fill("")
      .map(() =>
        Array.from({ length: 48 })
          .fill("")
          .map(() => ({
            count: 0,
            price: 0,
          }))
      ) as ISimTariffData[][];

    if (isSuccess && data.length > 0) {
      const dataResults = data.flatMap((dataSet) => dataSet.results);

      for (const result of dataResults) {
        const currentIntervalStart = new Date(result.valid_from);
        const currentIntervalEnd =
          result.valid_to === null
            ? getDate(new Date(), "year", false)
            : new Date(result.valid_to);

        if (category === "Agile") {
          const currentMonthIndex = currentIntervalStart.getMonth();
          let sessionNumber = currentIntervalStart.getHours() * 2;
          if (currentIntervalStart.getMinutes() === 30) sessionNumber++;

          const { price: prevPrict, count: prevCount } =
            newDataByTime[currentMonthIndex][sessionNumber];
          newDataByTime[currentMonthIndex][sessionNumber] = {
            price: prevPrict + result.value_inc_vat,
            count: prevCount + 1,
          };
        }

        if (["Tracker"].includes(category)) {
          const currentMonthIndex = currentIntervalStart.getMonth();
          newDataByTime[0].forEach((data, i) => {
            const { price: prevPrict, count: prevCount } =
              newDataByTime[currentMonthIndex][i];
            newDataByTime[currentMonthIndex][i] = {
              price:
                prevPrict +
                result.value_inc_vat +
                trackerUnitPriceIncrease2023[`_${value.gsp}` as gsp]["E"],
              count: prevCount + 1,
            };
          });
        }

        // not dependent on time of year
        if (["Cosy", "Go", "IGo", "Flux", "IFlux"].includes(category)) {
          const sessionStartIndex =
            currentIntervalStart.valueOf() <= firstOfMonthAYearEarlier.valueOf()
              ? 0
              : Math.floor(
                  (currentIntervalStart.getHours() * 60 +
                    currentIntervalStart.getMinutes()) /
                    30
                );
          const sessionEndIndex =
            currentIntervalEnd.valueOf() >= endOfLastMonth.valueOf()
              ? 47
              : Math.floor(
                  (currentIntervalEnd.getHours() * 60 +
                    currentIntervalEnd.getMinutes() -
                    30) /
                    30
                );

          const currentMonthIndex =
            currentIntervalStart.valueOf() <= firstOfMonthAYearEarlier.valueOf()
              ? firstOfMonthAYearEarlier.getMonth()
              : currentIntervalStart.getMonth();

          /* short-circuit: populate the year with the current month data */
          if (
            newDataByTime[currentMonthIndex].reduce(
              (acc, cur) => acc * cur.count,
              1
            ) !== 0
          ) {
            const monthData = [...newDataByTime[currentMonthIndex]];
            newDataByTime.forEach((_, i) => (newDataByTime[i] = monthData));
            break;
          }

          newDataByTime[0].forEach((data, i) => {
            if (
              (sessionEndIndex >= sessionStartIndex &&
                i <= sessionEndIndex &&
                i >= sessionStartIndex) ||
              (sessionEndIndex < sessionStartIndex &&
                (i >= sessionStartIndex || i <= sessionEndIndex))
            ) {
              const { price: prevPrict, count: prevCount } =
                newDataByTime[currentMonthIndex][i];
              newDataByTime[currentMonthIndex][i] = {
                price: prevPrict + result.value_inc_vat,
                count: prevCount + 1,
              };
            }
          });
        }

        if (["SVT", "Fixed"].includes(category)) {
          newDataByTime[0].forEach((data, i) => {
            Array.from({ length: 12 }).forEach((_, j) => {
              const { price: prevPrict, count: prevCount } =
                newDataByTime[j][i];
              newDataByTime[j][i] = {
                price: prevPrict + result.value_inc_vat,
                count: prevCount + 1,
              };
            });
          });

          /* short-circuit: if every month has data */
          if (newDataByTime[0].reduce((acc, cur) => acc * cur.count, 1) !== 0) {
            break;
          }
        }
      }
    }

    const dataByTimeYearlyValueArray = newDataByTime.map((dataset) =>
      dataset.map((data) => (data.count === 0 ? 0 : data.price / data.count))
    );
    return dataByTimeYearlyValueArray;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tariff, type, value.gsp, fromDate, toDate, category]);

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
      dataByTimeYearly,
    };
  } else {
    return {
      isLoading: false,
      error:
        "Sorry, no consumption data available. Please try to select a different meter or try later.",
    };
  }
};

export default useTariffQueryYearlyAverage;
