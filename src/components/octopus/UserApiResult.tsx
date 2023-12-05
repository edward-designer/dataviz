"use client";

import { useCallback, useContext, useState } from "react";
import { UserContext } from "@/context/user";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import { IUserApiResult, TariffCategory, TariffType } from "@/data/source";
import NotCurrentlySupported from "./NotCurrentlySupported";
import ConsumptionCalculator from "./ConsumptionCalculator";
import { evenRound } from "@/utils/helpers";
import Badge from "./Badge";
import Comparison from "./Comparison";
import { url } from "inspector";
import Remark from "./Remark";
import { EnergyIcon } from "./EnergyIcon";

const initialTariffsToCompare: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  cost: number;
}[] = [
  {
    tariff: "VAR-22-11-01",
    type: "E",
    category: "SVT",
    cost: 0,
  },
  {
    tariff: "SILVER-FLEX-22-11-25",
    type: "E",
    category: "Tracker",
    cost: 0,
  },
  {
    tariff: "AGILE-FLEX-22-11-25",
    type: "E",
    category: "Agile",
    cost: 0,
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

  const orderedTariffsToCompare = tariffsToCompare.sort(
    (a, b) => a.cost - b.cost
  );

  const updateCost = useCallback(
    (category: TariffCategory) => (cost: number) => {
      setTariffsToCompare((tariffsToCompare) =>
        tariffsToCompare.map((tariff) => {
          if (tariff.category === category) {
            return { ...tariff, cost };
          }
          return tariff;
        })
      );
    },
    []
  );

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
        <div>
          The following comparision is based on your actual energy use pattern
          in the past year to give an idea of which tariff suits you most
          <Remark variant="badge">
            The figures presented here are an approximation of your annul energy
            costs. Approximations and assumptions are used in the calculations.
            The actual costs may vary a lot depending on the previaling unit
            rates and change of usage patterns. Remember, past performance does
            not guarantee future.
          </Remark>
        </div>
      )}
      {isSuccess && (
        <div className="flex gap-4 flex-col lg:flex-row">
          {orderedTariffsToCompare.map(({ category, tariff, cost }, ind) =>
            cost ? (
              <div
                className="relative flex-1 border border-accentPink-500/30 min-h-[200px] lg:h-[300px] rounded-2xl flex flex-col justify-center items-center gap-2"
                key={category}
                style={{
                  background: "url('/images/octopus-winner.jpg') cover center",
                }}
              >
                <EnergyIcon type="E" />
                <a href={`/${category.toLowerCase()}`}>
                  <Badge
                    label={`Octopus ${
                      category === "SVT" ? "Variable Tariff" : category
                    }`}
                    variant="primary"
                  />
                </a>
                <div className="text-5xl">
                  <span>£{evenRound(cost, 2, true)}</span>
                </div>
                {category !== "SVT" ? (
                  <div className="flex flex-row">
                    -£
                    {orderedTariffsToCompare.find((d) => d.category === "SVT")
                      ?.cost! - cost}
                    <Comparison
                      change={evenRound(
                        ((cost -
                          orderedTariffsToCompare.find(
                            (d) => d.category === "SVT"
                          )?.cost!) *
                          100) /
                          cost,
                        0
                      )}
                      compare="Variable Tariff"
                    />
                  </div>
                ) : (
                  <div className="text-xs">Ofgem energy cost cap</div>
                )}
              </div>
            ) : (
              <ConsumptionCalculator
                key={category}
                MPAN={MPAN}
                ESerialNo={ESerialNo}
                tariff={tariff}
                fromDate={oneYearEarlier}
                toDate={yesterday}
                type="E"
                category={category}
                updateCost={updateCost(category)}
                cost={cost}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UserApiResult;
