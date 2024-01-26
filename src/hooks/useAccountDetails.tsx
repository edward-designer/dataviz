import { UserContext } from "@/context/user";
import { IUserApiResult } from "@/data/source";
import { getGsp } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";

const useAccountDetails = () => {
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
  const MPRN = data?.properties[0].gas_meter_points[0].mprn ?? "";
  const GSerialNo =
    data?.properties[0].gas_meter_points[0].meters[0].serial_number ?? "";
  const currentGTariff = currentGContract?.tariff_code.slice(5, -2) ?? "";

  const postcode = data?.properties[0].postcode;

  useEffect(() => {
    if (postcode && postcode !== value.postcode) {
      getGsp(postcode)
        .then((gsp) => {
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

  return {
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
  };
};

export default useAccountDetails;
