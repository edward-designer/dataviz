import { UserContext } from "@/context/user";
import { TariffType } from "@/data/source";
import useTariffQuery from "@/hooks/useTariffQuery";
import { useContext } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ITariffDetails {
  tariff_code: string;
  valid_from: string;
  type: TariffType;
}

const TariffDetails = ({ tariff_code, valid_from, type }: ITariffDetails) => {
  const { value, setValue } = useContext(UserContext);
  const { data, isSuccess, isLoading } = useTariffQuery<{
    display_name: string;
  }>({
    tariff: tariff_code,
    type,
  });

  const currentSelect = type === "E" ? "ESerialNo" : "GSerialNo";
  return (
    <div className="bg-theme-900/40 p-2 flex flex-col gap-1">
      <div className="flex flex-row items-center">
        <span className="inline-block w-[90px] text-white/70 text-sm">
          Current Tariff:
        </span>
        {isSuccess ? data[0]?.display_name ?? tariff_code : tariff_code}
      </div>
      <div className="flex flex-row items-center">
        <span className="inline-block w-[90px] text-white/70 text-sm">
          Date joined:
        </span>
        {new Date(valid_from).toLocaleDateString()}
      </div>
      <div className="flex flex-row items-center">
        <span className="inline-block w-[90px] text-white/70  text-sm">
          Meter No.:
        </span>
        <Select
          onValueChange={(newSelection: string) =>
            setValue({ ...value, [currentSelect]: newSelection })
          }
          value={value[currentSelect]}
        >
          <SelectTrigger className="w-auto max-w-full flex items-center justify-center p-0 m-0 h-7 text-lg">
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {value[type === "E" ? "ESerialNos" : "GSerialNos"].map(
                (serialNo) => (
                  <SelectItem key={serialNo} value={serialNo}>
                    {serialNo}
                  </SelectItem>
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TariffDetails;
