"use client";

import Loading from "@/components/Loading";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";

import useAccountDetails from "@/hooks/useAccountDetails";
import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import SavingsChart from "./SavingsChart";
import TariffDetails from "./TariffDetails";

const SavingsCalculation = () => {
  const {
    postcode,
    setValue,
    value,
    data,
    isSuccess,
    isLoading,
    error,
    isError,
    currentEContract,
    currentETariff,
    MPAN,
    ESerialNo,
    currentGContract,
    currentGTariff,
    MPRN,
    GSerialNo,
  } = useAccountDetails();

  const oneYearEarlier = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setFullYear(
      new Date().getFullYear() - 1
    )
  ).toISOString();

  if (
    isSuccess &&
    data &&
    (data.properties.length !== 1 ||
      data.properties[0].electricity_meter_points.length > 1 ||
      data.properties[0].gas_meter_points.length > 1)
  ) {
    return (
      <NotCurrentlySupported>
        Sorry, currently addresses with more than 1 gas and 1 electricity meters
        are not supported.
      </NotCurrentlySupported>
    );
  }
  if (isSuccess && !(MPAN || ESerialNo) && !(MPRN || GSerialNo)) {
    return (
      <NotCurrentlySupported>
        Sorry, owing to technical limitations, Octo cannot retrive your data at
        the moment. Please try again later.
      </NotCurrentlySupported>
    );
  }
  if (
    isSuccess &&
    typeof currentEContract === "undefined" &&
    typeof currentGContract === "undefined"
  ) {
    return (
      <NotCurrentlySupported>
        Sorry, owing to technical limitations, Octo cannot retrive your data at
        the moment. Please try again later.
      </NotCurrentlySupported>
    );
  }

  // shows a max of 1 year data
  let EfromDate = "";
  if (typeof currentEContract !== "undefined") {
    EfromDate =
      new Date(currentEContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : currentEContract.valid_from;
  }

  let GfromDate = "";
  if (typeof currentGContract !== "undefined") {
    GfromDate =
      new Date(currentGContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : currentGContract.valid_from;
  }

  return (
    <div className="flex gap-4 flex-col relative">
      {isLoading && (
        <div className=" min-h-screen">
          <Loading />
        </div>
      )}
      {isError && error && <div>{error.message}</div>}
      {isSuccess && (
        <>
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <div className="flex-grow">
              The following chart(s) give you an overview of how much you have
              saved in the period after you have switched to your current tariff
              for up to 1 year.
              <Remark>
                Approximations and assumptions are used in the calculations. The
                actual savings are likely to differ because of missing data and
                rounding. Also, please note the figures for the latest month may
                not be complete (maybe up to a few days earlier) as it takes
                time for your data to be updated.
              </Remark>
            </div>
          </div>
          {MPAN && ESerialNo && typeof currentEContract !== "undefined" && (
            <>
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
                <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Electricity Savings
              </h2>
              <TariffDetails
                valid_from={currentEContract.valid_from}
                tariff_code={currentETariff}
                type="E"
              />
              <SavingsChart
                tariff={currentETariff}
                fromDate={EfromDate}
                gsp={value.gsp}
                type="E"
                compareTo="SVT"
                deviceNumber={MPAN}
                serialNo={ESerialNo}
              />
            </>
          )}
          {MPRN && GSerialNo && typeof currentGContract !== "undefined" && (
            <>
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8">
                <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Gas Savings
              </h2>
              <TariffDetails
                valid_from={currentGContract.valid_from}
                tariff_code={currentGTariff}
                type="G"
              />
              <SavingsChart
                tariff={currentGTariff}
                fromDate={GfromDate}
                gsp={value.gsp}
                type="G"
                compareTo="SVT"
                deviceNumber={MPRN}
                serialNo={GSerialNo}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SavingsCalculation;
