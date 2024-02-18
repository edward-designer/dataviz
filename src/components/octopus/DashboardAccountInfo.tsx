"use client";

import { UserContext } from "@/context/user";
import { IUserApiResult } from "@/data/source";
import { dateDiff, getTariffName, toTitleCase } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";

import { PiSunDimFill } from "react-icons/pi";
import { SiOctopusdeploy } from "react-icons/si";
import { HiMiniHome } from "react-icons/hi2";
import { MdOutlineExpandCircleDown } from "react-icons/md";
import Loading from "../../app/loading";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { PiUserCircleFill } from "react-icons/pi";
import { RiEyeCloseLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa6";
import { RiSearchEyeLine } from "react-icons/ri";

import Button from "./Button";

const DashboardAccountInfo = () => {
  const { value } = useContext(UserContext);
  const [showKey, setShowKey] = useState(0);

  const queryFn = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/accounts/${value.accountNumber}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(value.apiKey)}`,
          },
        }
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(
          `Sorry, we have an error with your info: ${err.message}. Please check if your info are correct.`
        );
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const { data, isSuccess, isLoading, error, isError } =
    useQuery<IUserApiResult>({
      queryKey: ["user", value.accountNumber, value.apiKey],
      queryFn,
    });

  const properties = data?.properties.sort(
    (a, b) => Date.parse(b.moved_in_at) - Date.parse(a.moved_in_at)
  );

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col gap-6 border border-accentPink-950 rounded-xl p-4 bg-black/20">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-2">
        <PiUserCircleFill className="w-10 h-10" />
        Account Infos
      </h2>
      <div className="font-normal flex flex-col gap-2">
        <div className="flex flex-row gap-4 items-center">
          <span className="w-[120px] text-xs">Account No.:</span>
          <span className="flex-grow text-xs md:text-base">
            {value.accountNumber}
          </span>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <span className="w-[120px] text-xs">API Key:</span>
          <span className="flex-grow text-sm h-5">
            {showKey ? (
              <>{value.apiKey}</>
            ) : (
              <Button
                className="border border-accentPink-700 py-1 text-xs flex items-center gap-1"
                clickHandler={() => setShowKey(1)}
              >
                <RiSearchEyeLine /> Show
              </Button>
            )}
          </span>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <span className="w-[120px] text-xs">Grid Supply Point / GSP:</span>
          <span className="flex-grow text-xs md:text-base">{value.gsp}</span>
        </div>
        {value.EMPAN && (
          <>
            <div className="text-accentPink-700 text-2xl mt-2 border-t border-t-accentBlue-950">
              <PiSunDimFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity (export)
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">MPAN:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.EMPAN}
              </span>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">Meter Serial No.:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.EESerialNo}
              </span>
            </div>
          </>
        )}
        {value.MPAN && (
          <>
            <div className="text-accentPink-700 text-2xl mt-2 border-t border-t-accentBlue-950">
              <BsLightningChargeFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">MPAN:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.MPAN}
              </span>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">Meter Serial No.:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.ESerialNo}
              </span>
            </div>
          </>
        )}
        {value.MPRN && (
          <>
            <div className="text-accentPink-700 text-2xl mt-2 border-t border-t-accentBlue-950">
              <AiFillFire className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Gas
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">MPRN:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.MPRN}
              </span>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="w-[120px] text-xs">Meter Serial No.:</span>
              <span className="flex-grow text-xs md:text-base">
                {value.GSerialNo}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardAccountInfo;
