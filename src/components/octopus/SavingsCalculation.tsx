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

  let GfromDate = "";
  if (typeof value.currentGContract !== "undefined") {
    GfromDate =
      new Date(value.currentGContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : value.currentGContract.valid_from;
  }

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <div className="flex-grow">
              Monthly overview of energy cost savings after
              switching to the current tariff.
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
                  Electricity Savings
                </h2>
                <TariffDetails
                  valid_from={value.currentEContract.valid_from}
                  tariff_code={value.currentETariff}
                  type="E"
                />
                <SavingsChart
                  tariff={value.currentETariff}
                  fromDate={EfromDate}
                  gsp={value.gsp}
                  type="E"
                  compareTo="SVT"
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
                  Gas Savings
                </h2>
                <TariffDetails
                  valid_from={value.currentGContract.valid_from}
                  tariff_code={value.currentGTariff}
                  type="G"
                />
                <SavingsChart
                  tariff={value.currentGTariff}
                  fromDate={GfromDate}
                  gsp={value.gsp}
                  type="G"
                  compareTo="SVT"
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

export default SavingsCalculation;
