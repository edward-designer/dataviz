import { ITariffToCompare } from "@/data/source";
import { Dispatch, SetStateAction } from "react";
import { SelectItem } from "../ui/select";
import EnergyShiftSimTariffSelector from "./EnergyShiftSimTariffSelector";

interface ITrafficHoppingToolSelector {
  importTariff: string;
  importTariffs: ITariffToCompare[];
  setImportTariff: Dispatch<SetStateAction<string>>;
  exportTariff: string;
  exportTariffs: ITariffToCompare[];
  setExportTariff: Dispatch<SetStateAction<string>>;
  lineColor: string;
  label: string;
  isExporting?: boolean;
}

const TrafficHoppingToolSelector = ({
  importTariff,
  importTariffs,
  setImportTariff,
  exportTariff,
  exportTariffs,
  setExportTariff,
  lineColor = "green",
  label,
  isExporting = true,
}: ITrafficHoppingToolSelector) => {
  return (
    <div className="flex flex-row justify-start items-center gap-1 md:gap-5 flex-wrap bg-black/50 rounded-2xl p-2 md:p-4">
      <div
        className={`text-2xl font-bold text-accentBlue-500 font-display ${
          lineColor === "green" ? "text-green-700" : "text-slate-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`w-20 border-t-2 ${
          lineColor === "green" ? "border-green-700" : "border-slate-500"
        }`}
      />
      <div className="flex flex-row flex-wrap gap-1 md:gap-5 flex-grow">
        <EnergyShiftSimTariffSelector
          isExport={false}
          tariff={importTariff}
          tariffs={importTariffs}
          changeImportTariff={setImportTariff}
          changeExportTariff={setExportTariff}
          isExporting={isExporting}
        >
          {importTariffs.map(({ tariff }) => (
            <SelectItem key={tariff} value={tariff}>
              {tariff}
            </SelectItem>
          ))}
        </EnergyShiftSimTariffSelector>
        {isExporting && (
          <EnergyShiftSimTariffSelector
            isExport={true}
            tariff={exportTariff}
            tariffs={exportTariffs}
            changeImportTariff={setImportTariff}
            changeExportTariff={setExportTariff}
            isExporting={isExporting}
          >
            {exportTariffs.flatMap(({ tariff }) => [
              <SelectItem key={tariff} value={tariff}>
                {tariff}
              </SelectItem>,
            ])}
          </EnergyShiftSimTariffSelector>
        )}
      </div>
    </div>
  );
};

export default TrafficHoppingToolSelector;
