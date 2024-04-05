"use client";
import { UserContext } from "@/context/user";
import { IConsumptionData, TariffType } from "@/data/source";
import { getDate } from "@/utils/helpers";
import { useContext, useMemo } from "react";
import useConsumptionData from "./useConsumptionData";

export interface ISimConsumptionData {
  count: number;
  consumption: number;
}

export type IConsumptionYearlyPattern = {
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  isExport: boolean;
};

const useConsumptionYearlyPattern = (inputs: IConsumptionYearlyPattern) => {
  const { value } = useContext(UserContext);

  const { fromDate, toDate, type, isExport } = inputs;

  const endOfLastMonth = new Date();
  endOfLastMonth.setHours(0, 0, 0, 0);
  endOfLastMonth.setDate(1);
  const firstOfMonthAYearEarlier = getDate(endOfLastMonth, "year", true);

  const toDataISODate = endOfLastMonth.toISOString();
  const fromDataISODate = firstOfMonthAYearEarlier.toISOString();

  const deviceNumber = isExport ? value.EMPAN : value.MPAN;
  const serialNo = isExport ? value.EESerialNo : value.ESerialNo;

  //get readings
  const { data, isSuccess, isLoading } = useConsumptionData({
    fromISODate: fromDataISODate,
    toISODate: toDataISODate,
    type,
    category: "Agile",
    deviceNumber,
    serialNo,
    apiKey: value.apiKey,
    testRun: value.testRun,
  });
  const dataByTimeYearly = useMemo(() => {
    const newDataByMonth = Array.from({ length: 48 })
      .fill("")
      .map(() => ({
        count: 0,
        consumption: 0,
      }));
    const newDataByTime = Array.from({
      length: 12,
    })
      .fill("")
      .map(() => [...newDataByMonth]) as ISimConsumptionData[][];

    if (isSuccess && data.results.length > 0) {
      const dataResults = data.results as IConsumptionData[];
      dataResults.forEach((result) => {
        const currentIntervalStart = new Date(result.interval_start);
        const currentMonthIndex = currentIntervalStart.getMonth();

        let sessionNumber = currentIntervalStart.getHours() * 2;
        if (currentIntervalStart.getMinutes() >= 30) sessionNumber++;

        const currentData = newDataByTime[currentMonthIndex][sessionNumber];

        newDataByTime[currentMonthIndex][sessionNumber] = {
          consumption: currentData.consumption + result.consumption,
          count: currentData.count + 1,
        };
      });
    }

    const dataByTimeYearlyValueArray = newDataByTime.map((dataset) =>
      dataset.map((data) => data.consumption)
    );

    return dataByTimeYearlyValueArray;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, fromDate, toDate, type, deviceNumber, serialNo, value.apiKey]);

  if (isLoading) {
    return {
      isLoading: true,
      error: "",
    };
  }

  if (isSuccess && data.results.length > 0) {
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

export default useConsumptionYearlyPattern;
