import { BiExport, BiImport } from "react-icons/bi";
import { HiSearchCircle } from "react-icons/hi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getCategory } from "@/utils/helpers";
import { EETARIFFS, ITariffToCompare } from "@/data/source";
import { ReactNode, SetStateAction } from "react";

interface IEnergyShiftSimTariffSelector {
  tariff: string;
  tariffs: ITariffToCompare[];
  isExport?: boolean;
  isExporting?: boolean;
  changeImportTariff: (value: SetStateAction<string>) => void;
  changeExportTariff: (value: SetStateAction<string>) => void;
  children: ReactNode;
}

const EnergyShiftSimTariffSelector = ({
  isExport = false,
  isExporting = true,
  tariff,
  tariffs,
  changeImportTariff,
  changeExportTariff,
  children,
}: IEnergyShiftSimTariffSelector) => {
  return (
    <div className="flex items-center gap-1">
      {!isExport ? (
        <>
          <BiImport className="w-4 h-4 text-accentBlue-600" />
          <span className="text-sm text-accentBlue-600">Import:</span>
        </>
      ) : (
        <>
          <BiExport className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-orange-400">Export:</span>
        </>
      )}

      <a
        href={`/${getCategory(tariff).toLowerCase()}${
          isExport &&
          ["agile", "fixed"].includes(getCategory(tariff).toLowerCase())
            ? "Outgoing"
            : ""
        }`}
        target="_blank"
      >
        <HiSearchCircle
          aria-label={`${getCategory(tariff)} tariff details`}
          className="hover:text-accentBlue-500"
        />
      </a>
      <Select
        onValueChange={(newSelection: string) => {
          if (isExporting) {
            if (["Flux", "IFlux"].includes(getCategory(newSelection))) {
              changeExportTariff(newSelection.replace("IMPORT", "EXPORT"));
              changeImportTariff(newSelection.replace("EXPORT", "IMPORT"));
            } else if (["Go"].includes(getCategory(newSelection))) {
              changeExportTariff(
                EETARIFFS.find((tariff) =>
                  tariff.tariff.includes("OUTGOING-LITE-FIX")
                )?.tariff ?? "OUTGOING-LITE-FIX-12M-23-09-12"
              );
              changeImportTariff(newSelection.replace("EXPORT", "IMPORT"));
            } else if (["IGo"].includes(getCategory(newSelection))) {
              changeExportTariff(
                EETARIFFS.find((tariff) =>
                  tariff.tariff.includes("OUTGOING-FIX")
                )?.tariff ?? "OUTGOING-FIX-12M-19-05-13"
              );
              changeImportTariff(newSelection.replace("EXPORT", "IMPORT"));
            } else {
              isExport
                ? changeExportTariff(newSelection)
                : changeImportTariff(newSelection);
            }
          } else {
            isExport
              ? changeExportTariff(newSelection)
              : changeImportTariff(newSelection);
          }
        }}
        value={tariff}
      >
        <SelectTrigger className="w-auto flex items-center justify-center p-0 m-0 h-5 md:h-7 text-sm md:text-base [&>svg]:ml-0 [&>h1]:max-w-[170px] md:[&>h1]:max-w-fit">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{children}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnergyShiftSimTariffSelector;
