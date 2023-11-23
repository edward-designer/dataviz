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
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

function useTariffQuery<T>({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: TariffType;
  gsp?: string;
}): UseQueryResult<T[], Error> {
  const queryClient = useQueryClient();
  const typeArr = type
    .split("")
    .filter((type: string) => type === "E" || type === "G") as ApiTariffType[];

  // only need to fetch once
  if (!gsp) typeArr.length = 1;

  const query = useQuery<T[]>({
    queryKey: ["getTariff", tariff, type, gsp],
    queryFn: fetchApi(
      typeArr.map((type) => ({
        tariffType: type,
        url: gsp
          ? `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500`
          : `https://api.octopus.energy/v1/products/${tariff}/`,
      }))
    ),
  });
  return query;
}

export default useTariffQuery;
