"use client";

import { IUserApiResult } from "@/data/source";
import { getGsp } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

type TContract =
  | {
      tariff_code: string;
      valid_from: string;
      valid_to: string;
    }
  | undefined;
export interface IUserValue {
  postcode: string;
  gsp: string;
  apiKey: string;
  accountNumber: string;
  gasConversionFactor: number;
  trackerCode: string;
  agileCode: string;
  MPAN: string;
  ESerialNo: string;
  ESerialNos: string[];
  currentETariff: string;
  MPRN: string;
  GSerialNo: string;
  GSerialNos: string[];
  currentGTariff: string;
  error: string;
  currentEContract: TContract;
  currentGContract: TContract;
}

export const initialValue = {
  value: {
    postcode: "",
    gsp: "A",
    apiKey: "",
    accountNumber: "",
    gasConversionFactor: 11.1,
    trackerCode: "",
    agileCode: "",
    MPAN: "",
    ESerialNo: "",
    ESerialNos: [],
    currentETariff: "",
    MPRN: "",
    GSerialNo: "",
    GSerialNos: [],
    currentGTariff: "",
    error: "",
    currentEContract: undefined,
    currentGContract: undefined,
  } as IUserValue,
  setValue: (value: IUserValue) => {},
};

export const UserContext = createContext(initialValue);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState<IUserValue>(initialValue.value);

  // get account info
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
      enabled:
        !!value.accountNumber &&
        !!value.apiKey &&
        !value.ESerialNo &&
        !value.GSerialNo,
      retry: false,
    });

  const currentEContract = useMemo(
    () =>
      data?.properties
        ?.at(-1)
        ?.electricity_meter_points?.at(-1)
        ?.agreements.at(-1),
    [data]
  );
  const MPAN =
    data?.properties?.at(-1)?.electricity_meter_points?.at(-1)?.mpan ?? "";
  const ESerialNo =
    value.ESerialNo === ""
      ? data?.properties
          ?.at(-1)
          ?.electricity_meter_points?.at(-1)
          ?.meters?.at(-1)?.serial_number ?? ""
      : value.ESerialNo;
  const ESerialNos = useMemo(
    () =>
      data?.properties
        ?.at(-1)
        ?.electricity_meter_points?.at(-1)
        ?.meters?.map((meter) => meter.serial_number) ?? [],
    [data]
  );
  const currentETariff = currentEContract?.tariff_code.slice(5, -2) ?? "";
  const currentGContract = useMemo(
    () => data?.properties?.at(-1)?.gas_meter_points?.at(-1)?.agreements.at(-1),
    [data]
  );
  const MPRN = data?.properties?.at(-1)?.gas_meter_points?.at(-1)?.mprn ?? "";
  const GSerialNo =
    value.GSerialNo === ""
      ? data?.properties?.at(-1)?.gas_meter_points?.at(-1)?.meters?.at(-1)
          ?.serial_number ?? ""
      : value.GSerialNo;
  const GSerialNos = useMemo(
    () =>
      data?.properties
        ?.at(-1)
        ?.gas_meter_points?.at(-1)
        ?.meters?.map((meter) => meter.serial_number) ?? [],
    [data]
  );
  const currentGTariff = currentGContract?.tariff_code.slice(5, -2) ?? "";

  const postcode = data?.properties?.at(-1)?.postcode;

  useLayoutEffect(() => {
    const storedValue = window.localStorage.getItem("octoprice");
    if (storedValue && storedValue !== "undefined")
      setValue({ ...initialValue.value, ...JSON.parse(storedValue) });
  }, []);

  useLayoutEffect(() => {
    if (isSuccess && postcode && postcode !== value.postcode) {
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
  }, [isSuccess, postcode, setValue, value]);

  useLayoutEffect(() => {
    if (isSuccess)
      setValue((value) => ({
        ...value,
        MPAN,
        ESerialNo,
        ESerialNos,
        MPRN,
        GSerialNo,
        GSerialNos,
        currentEContract,
        currentETariff,
        currentGContract,
        currentGTariff,
      }));
  }, [
    ESerialNo,
    ESerialNos,
    GSerialNo,
    GSerialNos,
    MPAN,
    MPRN,
    currentEContract,
    currentETariff,
    currentGContract,
    currentGTariff,
    isSuccess,
    setValue,
  ]);

  // need to handle existing users with saved data
  const handleSetValue = useCallback((value: IUserValue) => {
    window.localStorage.setItem("octoprice", JSON.stringify(value));
    setValue(value);
  }, []);

  // handle errors
  if (
    !value.error &&
    isSuccess &&
    data &&
    ((data?.properties?.at(-1)?.electricity_meter_points?.length ?? 0) > 1 ||
      (data?.properties?.at(-1)?.gas_meter_points?.length ?? 0) > 1)
  ) {
    setValue({
      ...value,
      error:
        "Sorry, currently addresses with more than 1 gas and 1 electricity meters are not supported.",
    });
  }
  if (
    !value.error &&
    isSuccess &&
    !(MPAN || ESerialNo) &&
    !(MPRN || GSerialNo)
  ) {
    setValue({
      ...value,
      error:
        "Sorry, owing to technical limitations, Octo cannot retrive your data at the moment. Please try again later.",
    });
  }

  if (
    !value.error &&
    isSuccess &&
    typeof currentEContract === undefined &&
    typeof currentGContract === undefined
  ) {
    setValue({
      ...value,
      error:
        "Sorry, owing to technical limitations, Octo cannot retrive your data at the moment. Please try again later.",
    });
  }

  if (error) {
    toast.error(error.message);
  }

  return (
    <UserContext.Provider value={{ value, setValue: handleSetValue }}>
      {children}
    </UserContext.Provider>
  );
};
