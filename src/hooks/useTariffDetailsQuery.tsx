"use client";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

import { fetchApi, fetchEachApi } from "../utils/helpers";

function useTariffDetailsQuery<T>({
  tariff,
  type,
}: {
  tariff: string;
  type: "E" | "G";
}): UseQueryResult<T[], Error> {
  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getTariffDetails", tariff, type],
    queryFn: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/`,
      },
    ]),
  });
  return query;
}

export default useTariffDetailsQuery;
