import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import { formatPriceChangeWithSign, getTariffName } from "@/utils/helpers";

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

  return typeof total === "number" && !isNaN(total) ? (
    <>
      [{formatPriceChangeWithSign(total, false)}] {getTariffName(tariff)}{" "}
      <span className="text-[10px]">({tariff})</span>
    </>
  ) : (
    <>
      [N/A] {getTariffName(tariff)}{" "}
      <span className="text-[10px]">({tariff})</span>
    </>
  );
};

export default EnergyShiftSimTariffWithTotal;
