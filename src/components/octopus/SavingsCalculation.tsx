"use client";

import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";

import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import { PiSunDimFill } from "react-icons/pi";

import SavingsChart from "./SavingsChart";
import TariffDetails from "./TariffDetails";
import { useContext } from "react";
import { UserContext } from "@/context/user";
import { getCategory } from "@/utils/helpers";
import Link from "next/link";
import EarningChart from "./EarningChart";

const SavingsCalculation = () => {
  const { value, setValue } = useContext(UserContext);

  const yesterday = new Date(
    new Date(new Date().setHours(23, 59, 59, 999)).setDate(
      new Date().getDate() - 1
    )
  ).toISOString();
  const oneYearEarlier = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setFullYear(
      new Date().getFullYear() - 1
    )
  ).toISOString();

  // shows a max of 1 year data
  let EfromDate = "";
  if (typeof value.currentEContract !== "undefined") {
    EfromDate =
      new Date(value.currentEContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : value.currentEContract.valid_from;
  }

  let EEfromDate = "";
  if (typeof value.currentEEContract !== "undefined") {
    EEfromDate =
      new Date(value.currentEEContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : value.currentEEContract.valid_from;
  }

  let GfromDate = "";
  if (typeof value.currentGContract !== "undefined") {
    GfromDate =
      new Date(value.currentGContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : value.currentGContract.valid_from;
  }

  const isESVT = getCategory(value.currentETariff ?? "") === "SVT";
  const isGSVT = getCategory(value.currentGTariff ?? "") === "SVT";

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <div className="flex-grow">
              Monthly savings of current tariff vs Octopus Flexible (i.e. Ofgem
              Standard Variable Tariff), standing charges & VAT inclusive.
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
          {value.EMPAN &&
            value.EESerialNo &&
            typeof value.currentEEContract !== "undefined" && (
              <>
                <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
                  <PiSunDimFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                  Electricity Export Earnings
                </h2>
                <TariffDetails
                  valid_from={value.currentEEContract.valid_from}
                  tariff_code={value.currentEETariff}
                  type="E"
                />
                {isESVT ? (
                  <div>
                    You are currently on the Octopus Flexible Tariff.
                    <br />
                    <Link
                      href="/compare"
                      className="underline text-accentBlue-500 hover:no-underline"
                    >
                      Check whether you can save money by switching to another
                      tariff.
                    </Link>
                  </div>
                ) : (
                  <EarningChart
                    tariff={value.currentEETariff}
                    fromDate={EEfromDate}
                    gsp={value.gsp}
                    type="E"
                    deviceNumber={value.EMPAN}
                    serialNo={value.EESerialNo}
                  />
                )}
              </>
            )}
          {value.MPAN &&
            value.ESerialNo &&
            typeof value.currentEContract !== "undefined" && (
              <>
                <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
                  <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                  Electricity Savings
                </h2>
                <TariffDetails
                  valid_from={value.currentEContract.valid_from}
                  tariff_code={value.currentETariff}
                  type="E"
                />
                {isESVT ? (
                  <div>
                    You are currently on the Octopus Flexible Tariff.
                    <br />
                    <Link
                      href="/compare"
                      className="underline text-accentBlue-500 hover:no-underline"
                    >
                      Check whether you can save money by switching to another
                      tariff.
                    </Link>
                  </div>
                ) : (
                  <SavingsChart
                    tariff={value.currentETariff}
                    fromDate={EfromDate}
                    gsp={value.gsp}
                    type="E"
                    compareTo="SVT"
                    deviceNumber={value.MPAN}
                    serialNo={value.ESerialNo}
                  />
                )}
              </>
            )}
          {value.MPRN &&
            value.GSerialNo &&
            typeof value.currentGContract !== "undefined" && (
              <>
                <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8">
                  <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                  Gas Savings
                </h2>
                <TariffDetails
                  valid_from={value.currentGContract.valid_from}
                  tariff_code={value.currentGTariff}
                  type="G"
                />
                {isGSVT ? (
                  <div>
                    You are currently on the Octopus Flexible Tariff.
                    <br />
                    <Link
                      href="/compare"
                      className="underline text-accentBlue-500 hover:no-underline"
                    >
                      Check whether you can save money by switching to another
                      tariff.
                    </Link>
                  </div>
                ) : (
                  <SavingsChart
                    tariff={value.currentGTariff}
                    fromDate={GfromDate}
                    gsp={value.gsp}
                    type="G"
                    compareTo="SVT"
                    deviceNumber={value.MPRN}
                    serialNo={value.GSerialNo}
                  />
                )}
              </>
            )}
        </>
      )}
    </div>
  );
};

export default SavingsCalculation;
