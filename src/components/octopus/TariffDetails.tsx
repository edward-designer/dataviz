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
import { IoMdArrowDropright } from "react-icons/io";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { MdOutlineHistory } from "react-icons/md";
import { MdElectricMeter } from "react-icons/md";
import { MdGasMeter } from "react-icons/md";
import {
  getTariffCodeWithoutPrefixSuffix,
  getTariffName,
} from "@/utils/helpers";

interface ITariffDetails {
  tariff_code: string;
  valid_to: string | null;
  valid_from: string;
  type: TariffType;
  isCurrent?: boolean;
  dual?: boolean;
}

const TariffDetails = ({
  tariff_code,
  valid_from,
  valid_to,
  type,
  isCurrent = true,
  dual = false,
}: ITariffDetails) => {
  const { value, setValue } = useContext(UserContext);
  const { data, isSuccess, isLoading } = useTariffQuery<{
    display_name: string;
  }>({
    tariff: getTariffCodeWithoutPrefixSuffix(tariff_code),
    type,
  });

  const currentSelect = type === "E" ? "ESerialNo" : "GSerialNo";
  const meterSelection = type === "E" ? "ESerialNos" : "GSerialNos";
  return (
    <>
      <div className="-mb-5 text-theme-400/70 font-bold flex items-center gap-1">
        {isCurrent ? (
          <>
            {type === "G" ? <MdGasMeter /> : <MdElectricMeter />}
            Current
          </>
        ) : (
          <>
            <MdOutlineHistory />
            Previous
          </>
        )}{" "}
        Tariff
      </div>
      <div className="bg-theme-900/40 p-1 flex flex-row md:p-2 md:flex-col gap-1 justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center text-xs md:text-base">
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
              <SelectTrigger className="w-auto flex items-center justify-center p-0 m-0 h-5 md:h-7 text-xs md:text-base [&>svg]:ml-0">
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
        <div className="flex flex-col md:flex-row items-start md:items-center text-xs md:text-base">
          <span className="inline-block md:w-[90px] text-accentBlue-500 text-[12px] font-bold">
            Tariff:
          </span>
          {isSuccess && (
            <span>
              {getTariffName(getTariffCodeWithoutPrefixSuffix(tariff_code))}
              <span className="text-[10px]">
                {" "}
                ({getTariffCodeWithoutPrefixSuffix(tariff_code)})
              </span>
              {dual ? " - Economy 7" : ""}
            </span>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center text-xs md:text-base">
          <span className="inline-block md:w-[90px] text-accentBlue-500 text-[12px] font-bold">
            Duration:
          </span>
          {new Date(valid_from).toLocaleDateString("en-GB")}
          {valid_to ? (
            <>
              <div>
                <IoMdArrowDropright className="inline-block" />
                <span className="text-accentPink-300">
                  {new Date(valid_to).toLocaleDateString("en-GB")}
                </span>
              </div>
            </>
          ) : (
            <>
              <TbPlayerTrackNextFilled className="w-3 h-3 mx-1" />
              <em className="text-xs font-light relative -top-[2px] text-accentBlue-300">
                ongoing
              </em>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TariffDetails;
