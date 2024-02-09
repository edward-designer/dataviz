import { UserContext } from "@/context/user";
import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import { useContext } from "react";
import { ISimConsumptionData } from "./EnergyShiftSimContainer";

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

  return `${total !== undefined && `[£${total}] `}${tariff}`;
};

export default EnergyShiftSimTariffWithTotal;
