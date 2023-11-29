"use client";
import {
  UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ENERGY_TYPE,
  QueryTariffResult,
  TariffType,
  ApiTariffType,
  TariffResult,
  QuerySingleTariffPlanResult,
  DurationType,
  GSP,
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

function useAgileTariffQuery<T>({
  tariff,
}: {
  tariff: string;
}): UseQueryResult<T[], Error> {
  const queryClient = useQueryClient();

  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getAgileTariff", tariff],
    queryFn: fetchApi(
      GSP.map((code) => {
        return {
          gsp: code,
          url: `https://api.octopus.energy/v1/products/${tariff}/electricity-tariffs/E-1R-${tariff}-${code.replace(
            "_",
            ""
          )}/standard-unit-rates/?page_size=96`,
        };
      })
    ),
  });
  return query;
}

export default useAgileTariffQuery;
