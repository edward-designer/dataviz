"use client";

import Loading from "@/components/Loading";
import { UserContext } from "@/context/user";
import { IUserApiResult, TariffCategory, TariffType } from "@/data/source";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";
import TariffComparisionCard from "./TariffComparisionCard";
import useConsumptionCalculation from "@/hooks/useConsumptionCalculation";

const initialTariffsToCompare: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
}[] = [
  {
    tariff: "SILVER-FLEX-22-11-25",
    type: "E",
    category: "Tracker",
  },
  {
    tariff: "AGILE-FLEX-22-11-25",
    type: "E",
    category: "Agile",
  },
  {
    tariff: "VAR-22-11-01",
    type: "E",
    category: "SVT",
  },
];

const UserApiResult = () => {
  const { value, setValue } = useContext(UserContext);
  const [tariffsToCompare, setTariffsToCompare] = useState(
    initialTariffsToCompare
  );

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
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const { data, isSuccess, isLoading, error, isError } =
    useQuery<IUserApiResult>({
      queryKey: ["user", value.accountNumber, value.apiKey],
      queryFn,
    });

  const MPAN = data?.properties[0].electricity_meter_points[0].mpan ?? "";
  const ESerialNo =
    data?.properties[0].electricity_meter_points[0].meters[0].serial_number ??
    "";

  // pending GAS data
  const MPRN = data?.properties[0].gas_meter_points[0].mprn;
  const GSerialNo =
    data?.properties[0].gas_meter_points[0].meters[0].serial_number;

  const postcode = data?.properties[0].postcode;
  if (postcode && postcode !== value.postcode) {
    setValue({ ...value, postcode });
  }

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

  const { cost: SVTCost } = useConsumptionCalculation({
    tariff: "VAR-22-11-01",
    fromDate: oneYearEarlier,
    toDate: yesterday,
    type: "E",
    category: "SVT",
    MPAN,
    ESerialNo,
  });

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

  if (isSuccess && (!MPAN || !ESerialNo)) {
    <NotCurrentlySupported>
      Sorry, owing to technical limitations, Octo cannot retrive your data at
      the moment. Please try again later.
    </NotCurrentlySupported>;
  }

  return (
    <div className="flex gap-4 flex-col">
      {isLoading && <Loading />}
      {isError && <div>{error.message}</div>}
      {isSuccess && (
        <>
          <div>
            The following comparision is based on your actual energy use pattern
            in the past year to give an idea of which tariff suits you most
            <Remark variant="badge">
              The figures presented here are an approximation of your annul
              energy costs. Approximations and assumptions are used in the
              calculations. The actual costs may vary a lot depending on the
              previaling unit rates and change of usage patterns. Remember, past
              performance does not guarantee future.
            </Remark>
          </div>
          <div className="flex gap-4 flex-col lg:flex-row first-of-type:bg-black">
            {tariffsToCompare.map(({ tariff, category }) => (
              <TariffComparisionCard
                key={category}
                MPAN={MPAN}
                ESerialNo={ESerialNo}
                tariff={tariff}
                category={category}
                fromDate={oneYearEarlier}
                toDate={yesterday}
                compareTo={SVTCost}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserApiResult;
