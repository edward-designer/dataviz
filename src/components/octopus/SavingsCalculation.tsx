"use client";

import Loading from "@/components/Loading";
import { UserContext } from "@/context/user";
import { IUserApiResult } from "@/data/source";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";

import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import SavingsChart from "./SavingsChart";
import TariffDetails from "./TariffDetails";
import { getGsp } from "@/utils/helpers";

const SavingsCalculation = () => {
  const { value, setValue } = useContext(UserContext);

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

  const currentEContract =
    data?.properties[0].electricity_meter_points[0].agreements.at(-1);
  const MPAN = data?.properties[0].electricity_meter_points[0].mpan ?? "";
  const ESerialNo =
    data?.properties[0].electricity_meter_points[0].meters[0].serial_number ??
    "";

  const currentETariff = currentEContract?.tariff_code.slice(5, -2) ?? "";
  const currentGContract =
    data?.properties[0].gas_meter_points[0].agreements.at(-1);
  const MPRN = data?.properties[0].gas_meter_points[0].mprn;
  const GSerialNo =
    data?.properties[0].gas_meter_points[0].meters[0].serial_number;
  const currentGTariff = currentGContract?.tariff_code.slice(5, -2) ?? "";

  const postcode = data?.properties[0].postcode;
  useEffect(() => {
    if (postcode && postcode !== value.postcode) {
      getGsp(postcode)
        .then((gsp) => {
          console.log(gsp);
          if (gsp !== false)
            setValue({
              ...value,
              postcode: postcode.toUpperCase(),
              gsp: gsp.replace("_", ""),
            });
        })
        .catch((error: unknown) => {
          if (error instanceof Error) throw new Error(error.message);
        });
    }
  }, [postcode, setValue, value]);

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

  if (
    isSuccess &&
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
      {isError && <div>{error.message}</div>}
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
