import { BiExport, BiImport } from "react-icons/bi";
import { GiBattery75 } from "react-icons/gi";

import Badge from "./Badge";
import { UserContext } from "@/context/user";
import { useContext } from "react";

interface IEnergyShfitSimEnergyCounter {
  batteryImport: number[];
  batteryExport: number[];
}

const EnergyShiftSimBatteryState = ({
  batteryImport,
  batteryExport,
}: IEnergyShfitSimEnergyCounter) => {
  const { value } = useContext(UserContext);

  const maxCapacity = value.configBattery.capacity;

  let batteryPower = 0;
  let minBattery = 0;

  let i = 0;
  for (const value of batteryImport) {
    batteryPower += value - batteryExport[i];
    if (batteryPower > maxCapacity) break;
    if (batteryPower < 0) break;
    i++;
  }

  const batteryNormal = batteryPower <= maxCapacity && batteryPower >= 0;

  return (
    <div className="text-3xl md:text-4xl flex items-center justify-center gap-2">
      <GiBattery75 className="w-8 h-8" aria-label="export" />

      <div
        className={`flex flex-col md:flex-row flex-wrap justify-between items-start md:block bg-theme-900/30 
          ${batteryNormal ? "text-[#85f9ad]" : "text-[#f985c5]"}`}
      >
        <Badge label="Battery Power" variant="item" />
        <div className="font-digit text:3xl md:text-4xl flex flex-col items-end justify-start">
          {Math.round(batteryPower)}
        </div>
        <div className="text-xs text-[#f985c5] h-4 -mt-1">
          {batteryNormal
            ? " "
            : `error @ ${Math.floor(i / 2)}:${i % 2 === 1 ? "30" : "00"}`}
        </div>
      </div>
      <span className="text-6xl text-center self-start">/</span>
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
        <Badge label="Max. Capacity" variant="item" />
        <div className="font-digit text:3xl md:text-4xl flex flex-col items-end justify-start">
          {maxCapacity === Infinity ? "--" : maxCapacity}
        </div>
        <div className="text-sm text-white h-4 -mt-1"></div>
      </div>
      <span className="text-xl self-end">kWh</span>
    </div>
  );
};

export default EnergyShiftSimBatteryState;
