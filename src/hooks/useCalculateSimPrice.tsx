import { evenRound, getCategory } from "@/utils/helpers";
import useTariffQueryAverage from "./useTariffQueryAverage";
import { ISimConsumptionData } from "@/components/octopus/EnergyShiftSimContainer";

interface IuseCalculateSimPrice {
  tariff: string;
  gsp: string;
  fromDate: string;
  toDate: string;
  daysOfWeek: number[];
  noOfDays: number;
  consumption: ISimConsumptionData[];
}

const useCalculateSimPrice = ({
  tariff,
  gsp,
  fromDate,
  toDate,
  daysOfWeek,
  noOfDays,
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

  const total =
    tariff && consumption.length > 0 && dataByTime
      ? (consumption.reduce(
          (acc, cur, i) =>
            (cur.count === 0
              ? 0
              : (cur.consumption / cur.count) *
                (dataByTime[i].price / dataByTime[i].count)) + acc,
          0
        ) *
          noOfDays) /
        100
      : undefined;
  return total;
};

export default useCalculateSimPrice;
