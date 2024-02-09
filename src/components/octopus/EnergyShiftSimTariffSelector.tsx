import { BiExport, BiImport } from "react-icons/bi";
import { HiSearchCircle } from "react-icons/hi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getCategory } from "@/utils/helpers";
import { ITariffToCompare } from "@/data/source";
import { SetStateAction } from "react";

interface IEnergyShiftSimTariffSelector {
  tariff: string;
  tariffs: ITariffToCompare[];
  isExport?: boolean;
  changeImportTariff: (value: SetStateAction<string>) => void;
  changeExportTariff: (value: SetStateAction<string>) => void;
}

const EnergyShiftSimTariffSelector = ({
  isExport = false,
  tariff,
  tariffs,
  changeImportTariff,
  changeExportTariff,
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
          <BiExport className="w-4 h-4 text-orange-700" />
          <span className="text-sm text-orange-700">Export:</span>
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
        onValueChange={(newSelection: string) =>
          isExport
            ? changeExportTariff(newSelection)
            : changeImportTariff(newSelection)
        }
        value={tariff}
      >
        <SelectTrigger className="w-auto flex items-center justify-center p-0 m-0 h-5 md:h-7 text-sm md:text-base [&>svg]:ml-0">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {tariffs.map(({ tariff }) => (
              <SelectItem key={tariff} value={tariff}>
                {tariff}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnergyShiftSimTariffSelector;
