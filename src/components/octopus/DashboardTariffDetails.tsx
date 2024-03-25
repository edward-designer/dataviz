import { UserContext } from "@/context/user";
import { Single_tariff, TariffType, gsp } from "@/data/source";
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
import DashboardPricePane from "./DashboardPricePane";
import { HiVizContext } from "@/context/hiViz";
import { getCategory, getTariffName } from "@/utils/helpers";

interface IDashboardTariffDetails {
  tariff_code: string;
  valid_from: string;
  valid_to: string;
  type: TariffType;
  dual?: boolean;
}

const DashboardTariffDetails = ({
  tariff_code,
  valid_from,
  valid_to,
  type,
  dual = false,
}: IDashboardTariffDetails) => {
  const { hiViz } = useContext(HiVizContext);
  const { value, setValue } = useContext(UserContext);
  const { data, isSuccess, isLoading } = useTariffQuery<{
    display_name: string;
    full_name: string;
    code: string;
    single_register_electricity_tariffs: Single_tariff;
    single_register_gas_tariffs: Single_tariff;
  }>({
    tariff: tariff_code,
    type,
  });

  const currentSelect = type === "E" ? "ESerialNo" : "GSerialNo";
  const meterSelection = type === "E" ? "ESerialNos" : "GSerialNos";
  const singleRegisterType =
    type === "E"
      ? "single_register_electricity_tariffs"
      : "single_register_gas_tariffs";

  return (
    <>
      <div
        className={`${hiViz ? "bg-black" : "bg-theme-900/40"}
        } p-1 flex flex-col md:p-2 gap-1 justify-between text-xs md:text-base`}
      >
        <div className="flex flex-row items-center whitespace-nowrap overflow-hidden">
          <span className="inline-block w-[100px] text-accentBlue-500 font-light">
            Current Tariff:
          </span>
          {isSuccess ? data[0]?.full_name : tariff_code} {dual?"Economy 7":""}
        </div>
        <div className="flex flex-row items-center whitespace-nowrap overflow-hidden">
          <span className="inline-block w-[100px] text-accentBlue-500 font-light">
            Tariff Code:
          </span>
          <span>{tariff_code}</span>
        </div>
        <div className="flex flex-row items-center whitespace-nowrap overflow-hidden">
          <span className="inline-block w-[100px] text-accentBlue-500 font-light">
            Duration:
          </span>
          {new Date(valid_from).toLocaleDateString("en-GB")}
          {valid_to ? (
            <>
              <IoMdArrowDropright />
              <span className="text-accentPink-300">
                {new Date(valid_to).toLocaleDateString("en-GB")}
              </span>
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
        <div className="flex flex-row items-center whitespace-nowrap overflow-hidden">
          <span className="inline-block w-[100px] text-accentBlue-500 font-light">
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
      </div>
      <DashboardPricePane
        tariff={tariff_code}
        type={type !== "EG" ? type : "E"}
        gsp={value.gsp}
        standingCharge={
          data?.[0]?.[singleRegisterType]?.[`_${value.gsp}` as gsp]
            ?.direct_debit_monthly?.standing_charge_inc_vat ??
          data?.[0]?.[singleRegisterType]?.[`_${value.gsp}` as gsp]?.varying
            ?.standing_charge_inc_vat ??
          0
        }
        dual={dual}
      />
    </>
  );
};

export default DashboardTariffDetails;
