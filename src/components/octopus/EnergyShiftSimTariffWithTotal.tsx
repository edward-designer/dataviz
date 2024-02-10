import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import { formatPriceChangeWithSign } from "@/utils/helpers";

interface IEnergyShiftSimTariffWithTotal {
  tariff: string;
  gsp: string;
  fromDate: string;
  toDate: string;
  daysOfWeek: number[];
  numOfDays: number;
  consumption: number[];
}

const EnergyShiftSimTariffWithTotal = ({
  tariff,
  gsp,
  fromDate,
  toDate,
  daysOfWeek,
  numOfDays,
  consumption,
}: IEnergyShiftSimTariffWithTotal) => {
  const total = useCalculateSimPrice({
    tariff,
    gsp,
    fromDate,
    toDate,
    daysOfWeek,
    numOfDays,
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
