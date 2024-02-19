import { BiExport, BiImport } from "react-icons/bi";
import Badge from "./Badge";

interface IEnergyShfitSimEnergyCounter {
  isExport: boolean;
  use: number;
  total: number;
}

const EnergyShiftSimEnergyCounter = ({
  isExport,
  use,
  total,
}: IEnergyShfitSimEnergyCounter) => {
  const label = isExport ? "Export" : "Import";
  return (
    <div className="text-3xl md:text-4xl flex items-center justify-center gap-2">
      {isExport ? (
        <BiExport className="w-8 h-8" aria-label="export" />
      ) : (
        <BiImport className="w-8 h-8" aria-label="import" />
      )}
      <div
        className={`flex flex-wrap justify-between items-start md:block bg-theme-900/30 
          ${use <= total ? "text-[#85f9ad]" : "text-[#f985c5]"}`}
      >
        <Badge label={label} variant="item" />
        <div className="font-digit text:3xl md:text-4xl flex flex-col items-end justify-start">
          {use}
        </div>
        <div className="text-xs text-slate-300 h-4 -mt-1">
          vs avg: {use - total}
        </div>
      </div>
      <span className="text-6xl text-center self-start">/</span>
      <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
        <Badge label={`Avg. ${label}`} variant="item" />
        <div className="font-digit text:3xl md:text-4xl flex flex-col items-end justify-start">
          {total}
        </div>
        <div className="text-sm text-white h-4 -mt-1"></div>
      </div>
      <span className="text-xl self-end">Wh</span>
    </div>
  );
};

export default EnergyShiftSimEnergyCounter;
