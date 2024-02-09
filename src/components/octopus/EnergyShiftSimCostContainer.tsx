import {
  formatNumberToDisplay,
  formatPriceChangeWithSign,
  getCategory,
} from "@/utils/helpers";
import { BiExport, BiImport } from "react-icons/bi";
import { RiMoneyPoundBoxLine } from "react-icons/ri";
import SimpleLoading from "./SimpleLoading";

interface IEnergyShiftSimCostContainer {
  label: string;
  importTariff: string;
  importCost: number | undefined;
  exportTariff?: string;
  exportEarning?: number;
  hasExport?: boolean;
  variant?: "default" | "current";
}

const EnergyShiftSimCostContainer = ({
  label,
  importTariff,
  importCost,
  exportTariff,
  exportEarning,
  hasExport = false,
  variant = "default",
}: IEnergyShiftSimCostContainer) => {
  return (
    <div
      className={`flex w-full flex-col bg-theme-900 px-4 py-4 ${
        hasExport ? "min-h-[140px]" : "min-h-[100px]"
      } ${variant === "current" ? "bg-theme-950" : "bg-theme-900"}`}
    >
      {importCost === undefined ||
      (hasExport && exportEarning === undefined) ? (
        <div className="flex flex-grow w-full items-end justify-end">
          <SimpleLoading />
        </div>
      ) : (
        <div className="flex w-full flex-col pt-2">
          <h4
            className={`${
              variant === "current"
                ? "text-accentPink-600"
                : "text-accentBlue-500"
            } text-sm`}
          >
            {label}
          </h4>
          {exportTariff && exportEarning !== undefined ? (
            <>
              <div className="flex-1 flex flex-row items-center justify-between gap-1 text-white text-2xl">
                <span className="flex gap-1 items-center">
                  <RiMoneyPoundBoxLine
                    className="w-6 h-6"
                    aria-label="net cost"
                  />
                  Net Cost
                </span>
                <span>
                  {formatPriceChangeWithSign(importCost - exportEarning, false)}
                </span>
              </div>
              <div className="flex-1 flex flex-row items-center justify-between gap-1 text-sm">
                <span className="flex gap-1 items-center text-xs">
                  <BiImport
                    className="w-4 h-4 text-accentBlue-600 min-w-4"
                    aria-label="import"
                  />
                  {importTariff}
                </span>
                <span>{formatPriceChangeWithSign(importCost, false)}</span>
              </div>
              <div className="flex-1 flex flex-row items-center justify-between gap-1 text-sm">
                <span className="flex gap-1 items-center text-xs min-w-4">
                  <BiExport
                    className="w-4 h-4 text-orange-700 "
                    aria-label="export"
                  />
                  {exportTariff}
                </span>
                <span>{formatPriceChangeWithSign(exportEarning, false)}</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-row items-center justify-between gap-1 text-white text-2xl">
              <span className="flex gap-1 items-center">
                <BiImport className="w-6 h-6" aria-label="import" />
                {getCategory(importTariff)}
                <span className="text-[10px] leading-tight">
                  {importTariff}
                </span>
              </span>
              <span>{formatPriceChangeWithSign(importCost, false)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnergyShiftSimCostContainer;
