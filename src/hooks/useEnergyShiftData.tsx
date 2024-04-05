import { TariffType, gsp } from "@/data/source";
import useConsumptionPattern from "./useConsumptionPattern";
import useTariffQueryAverage from "./useTariffQueryAverage";
import { evenRound, getCategory } from "@/utils/helpers";
import { useMemo } from "react";
import { max, median } from "d3";
import useCalculateSimPrice from "./useCalculateSimPrice";

interface IUseEnergyShiftData {
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  deviceNumber: string;
  serialNo: string;
  daysOfWeek: number[];
  tariff: string;
  gsp: string;
  testRun?: boolean;
}

const useEnergyShiftData = ({
  fromDate,
  toDate,
  type,
  deviceNumber,
  serialNo,
  daysOfWeek,
  tariff,
  gsp,
  testRun = false,
}: IUseEnergyShiftData) => {
  const { dataByTime } = useConsumptionPattern({
    fromDate,
    toDate,
    type,
    deviceNumber,
    serialNo,
    daysOfWeek,
  });

  const { dataByTime: dataByTimeTariff } = useTariffQueryAverage({
    tariff,
    type,
    gsp,
    fromDate,
    toDate,
    category: getCategory(tariff),
    enabled: tariff !== "",
    daysOfWeek,
  });

  const totalValue = dataByTime
    ? evenRound(dataByTime.reduce((acc, cur) => acc + cur, 0) * 1000, 0)
    : Infinity;

  const avgTariffPrice =
    getCategory(tariff) === "Agile"
      ? (dataByTimeTariff?.reduce((acc, cur) => acc + cur, 0) ?? 0) / 48
      : dataByTimeTariff
      ? median(dataByTimeTariff)
      : 0;

  return { dataByTime, dataByTimeTariff, totalValue, avgTariffPrice };
};

export default useEnergyShiftData;
