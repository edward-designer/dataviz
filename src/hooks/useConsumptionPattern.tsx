"use client";
import { UserContext } from "@/context/user";
import { IConsumptionData, TariffType } from "@/data/source";
import { getDate } from "@/utils/helpers";
import { useContext, useMemo } from "react";
import useConsumptionData from "./useConsumptionData";

export type IConsumptionPattern = {
  deviceNumber: string;
  serialNo: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  daysOfWeek?: number[]; // 0 - Sunday
};

const useConsumptionPattern = (inputs: IConsumptionPattern) => {
  const { value } = useContext(UserContext);

  const {
    fromDate,
    toDate,
    type,
    deviceNumber,
    serialNo,
    daysOfWeek = [0, 1, 2, 3, 4, 5, 6],
  } = inputs;

  // avoid unnecessary refetching of consumption data if range is narrower
  const fromISODate = new Date(fromDate);
  const toISODate = new Date(toDate);

  const fromDataISODate = getDate(new Date(), "year", true).toISOString();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const toDataISODate = todayDate.toISOString();

  //get readings
  const { data, isSuccess, isLoading } = useConsumptionData({
    fromISODate: fromDataISODate,
    toISODate: toDataISODate,
    type,
    category: "Agile",
    deviceNumber,
    serialNo,
    apiKey: value.apiKey,
  });

  const dataByTime = useMemo(() => {
    const newDataByTime = Array.from({ length: 48 }).fill({
      count: 0,
      consumption: 0,
    }) as { count: number; consumption: number }[];

    if (isSuccess && data.results.length > 0) {
      const dataResults = data.results as IConsumptionData[];
      dataResults.forEach((result) => {
        const currentIntervalStart = new Date(result.interval_start);
        if (
          currentIntervalStart.valueOf() >= fromISODate.valueOf() &&
          currentIntervalStart.valueOf() < toISODate.valueOf() &&
          daysOfWeek.includes(currentIntervalStart.getDay())
        ) {
          let sessionNumber = currentIntervalStart.getHours() * 2;
          if (currentIntervalStart.getMinutes() >= 30) sessionNumber++;
          const { consumption: prevConsumption, count: prevCount } =
            newDataByTime[sessionNumber];
          newDataByTime[sessionNumber] = {
            consumption: prevConsumption + result.consumption,
            count: prevCount + 1,
          };
        }
      });
    }
    return newDataByTime;
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
      dataByTime,
    };
  } else {
    return {
      isLoading: false,
      error:
        "Sorry, no consumption data available. Please try to select a different meter or try later.",
    };
  }
};

export default useConsumptionPattern;
