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
  const meterSelection = type === "E" ? "ESerialNos" : "GSerialNos";
  return (
    <div className="bg-theme-900/40 p-1 flex flex-row md:p-2 md:flex-col gap-1 justify-between">
      <div className="flex flex-col md:flex-row items-start md:items-center text-sm md:text-base">
        <span className="inline-block md:w-[90px] text-accentBlue-500 text-[12px] font-bold">
          Meter No.:
        </span>
        {value[meterSelection].length > 1 ? (
          <Select
            onValueChange={(newSelection: string) =>
              setValue({ ...value, [currentSelect]: newSelection })
            }
            value={value[currentSelect]}
          >
            <SelectTrigger className="w-auto flex items-center justify-center p-0 m-0 h-5 md:h-7 text-sm md:text-base [&>svg]:ml-0">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {value[meterSelection].map((serialNo) => (
                  <SelectItem key={serialNo} value={serialNo}>
                    {serialNo}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          value[currentSelect]
        )}
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center text-sm md:text-base">
        <span className="inline-block md:w-[90px] text-accentBlue-500 text-[12px] font-bold">
          Current Tariff:
        </span>
        {isSuccess ? data[0]?.display_name ?? tariff_code : tariff_code}
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center text-sm md:text-base">
        <span className="inline-block md:w-[90px] text-accentBlue-500 text-[12px] font-bold">
          Date joined:
        </span>
        {new Date(valid_from).toLocaleDateString()}
      </div>
    </div>
  );
};

export default TariffDetails;
