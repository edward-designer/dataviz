"use client";

import Loading from "@/components/Loading";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";

import useAccountDetails from "@/hooks/useAccountDetails";
import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import SavingsChart from "./SavingsChart";
import TariffDetails from "./TariffDetails";
import { useContext } from "react";
import { UserContext } from "@/context/user";
import { getCategory } from "@/utils/helpers";
import Link from "next/link";

const TrackerComparision = () => {
  const { value, setValue } = useContext(UserContext);

  const dec2023 = new Date("2023-12-01").toISOString();

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <div className="flex-grow">
              Octopus is moving all Tracker customers the new Tracker on 15th
              February. This tool shows you how much you need to pay for your
              usage and standing charges (inclusive of VAT).
              <Remark>
                Approximations and assumptions are used in the calculations. The
                actual savings are likely to differ because of missing data and
                rounding. Also, please note the figures for the latest month may
                not be complete (maybe up to a few days earlier) as it takes
                time for your data to be updated. Kindly note that this page is
                still in beta version and may not be able to cater to all
                Octopus customer accounts. Should you encounter any issues while
                using this page, please contact Edward at{" "}
                <a
                  href="mailto:edward.chung.dev@gmail.com"
                  className="underline"
                >
                  edward.chung.dev@gmail.com
                </a>
                . Thanks a lot!
              </Remark>
            </div>
          </div>
          {value.MPAN &&
            value.ESerialNo &&
            typeof value.currentEContract !== "undefined" && (
              <>
                <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
                  <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                  Electricity Tracker Comparision
                </h2>
                <SavingsChart
                  tariff="SILVER-23-12-06"
                  fromDate={dec2023}
                  gsp={value.gsp}
                  type="E"
                  compareTo="SILVER-FLEX-BB-23-02-08"
                  deviceNumber={value.MPAN}
                  serialNo={value.ESerialNo}
                />
              </>
            )}
          {value.MPRN &&
            value.GSerialNo &&
            typeof value.currentGContract !== "undefined" && (
              <>
                <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8">
                  <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                  Gas Tracker Comparision
                </h2>
                <SavingsChart
                  tariff="SILVER-23-12-06"
                  fromDate={dec2023}
                  gsp={value.gsp}
                  type="G"
                  compareTo="SILVER-FLEX-BB-23-02-08"
                  deviceNumber={value.MPRN}
                  serialNo={value.GSerialNo}
                />
              </>
            )}
        </>
      )}
    </div>
  );
};

export default TrackerComparision;
