import { UserContext } from "@/context/user";
import { IUserApiResult } from "@/data/source";
import useAccountDetails from "@/hooks/useAccountDetails";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef } from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";

const DataArtContainer = () => {
  const chartRef = useRef<null | HTMLDivElement>(null);

  const oneYearEarlier = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setFullYear(
      new Date().getFullYear() - 1
    )
  ).toISOString();

  /* gather all data*/
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

  useEffect(() => {
    if (chartRef.current) return;
  }, []);

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
    <div className="flex w-full aspect-[210/297] bg-red-200">
      {value.postcode}
      <div ref={chartRef}></div>
    </div>
  );
};

export default DataArtContainer;
