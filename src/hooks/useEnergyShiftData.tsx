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

  const maxValue = useMemo(() => {
    if (dataByTime) return max(dataByTime);
  }, [dataByTime]);

  const totalValue = dataByTime
    ? evenRound(dataByTime.reduce((acc, cur) => acc + cur, 0) * 1000, 0)
    : Infinity;

  const avgTariffPrice =
    getCategory(tariff) === "Agile"
      ? (dataByTimeTariff?.reduce((acc, cur) => acc + cur, 0) ?? 0) / 48
      : dataByTimeTariff
      ? median(dataByTimeTariff)
      : 0;

  return { dataByTime, dataByTimeTariff, maxValue, totalValue, avgTariffPrice };
};

export default useEnergyShiftData;
