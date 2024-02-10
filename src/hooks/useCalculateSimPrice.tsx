import { evenRound, getCategory } from "@/utils/helpers";
import useTariffQueryAverage from "./useTariffQueryAverage";
import { useMemo } from "react";

interface IuseCalculateSimPrice {
  tariff: string;
  gsp: string;
  fromDate: string;
  toDate: string;
  daysOfWeek: number[];
  numOfDays: number;
  consumption: number[];
}

const useCalculateSimPrice = ({
  tariff,
  gsp,
  fromDate,
  toDate,
  daysOfWeek,
  numOfDays,
  consumption,
}: IuseCalculateSimPrice) => {
  const { dataByTime } = useTariffQueryAverage({
    tariff,
    type: "E",
    gsp,
    fromDate,
    toDate,
    category: getCategory(tariff),
    enabled: tariff !== "" && consumption.length > 0,
    daysOfWeek,
  });

  const total = useMemo(
    () =>
      tariff && consumption.length > 0 && dataByTime
        ? (consumption.reduce((acc, cur, i) => cur * dataByTime[i] + acc, 0) *
            numOfDays) /
          100
        : undefined,
    [tariff, numOfDays, consumption, dataByTime]
  );
  return total;
};

export default useCalculateSimPrice;
