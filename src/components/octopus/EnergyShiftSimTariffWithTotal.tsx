import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import { ISimConsumptionData } from "./EnergyShiftSimContainer";
import { formatPriceChangeWithSign } from "@/utils/helpers";

interface IEnergyShiftSimTariffWithTotal {
  tariff: string;
  gsp: string;
  fromDate: string;
  toDate: string;
  daysOfWeek: number[];
  noOfDays: number;
  consumption: ISimConsumptionData[];
}

const EnergyShiftSimTariffWithTotal = ({
  tariff,
  gsp,
  fromDate,
  toDate,
  daysOfWeek,
  noOfDays,
  consumption,
}: IEnergyShiftSimTariffWithTotal) => {
  const total = useCalculateSimPrice({
    tariff,
    gsp,
    fromDate,
    toDate,
    daysOfWeek,
    noOfDays,
    consumption,
  });
  console.log(total);
  return `${
    typeof total === "number" && !isNaN(total)
      ? `[${formatPriceChangeWithSign(total, false)}] `
      : `[N/A] `
  }${tariff}`;
};

export default EnergyShiftSimTariffWithTotal;
