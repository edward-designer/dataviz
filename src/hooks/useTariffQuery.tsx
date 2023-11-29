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
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

function useTariffQuery<T>({
  tariff,
  type,
  gsp,
  duration = "month",
}: {
  tariff: string;
  type: TariffType;
  gsp?: string;
  duration?: DurationType;
}): UseQueryResult<T[], Error> {
  const queryClient = useQueryClient();
  const typeArr = type
    .split("")
    .filter((type: string) => type === "E" || type === "G") as ApiTariffType[];
  const noOfRecords = {
    month: 1500,
    week: 336,
    "2-days": 96,
    day: 48,
  };
  // only need to fetch once
  if (!gsp) typeArr.length = 1;
  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getTariff", tariff, type, gsp, duration],
    queryFn: fetchApi(
      typeArr.map((type) => {
        return {
          tariffType: type,
          url: gsp
            ? `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=${noOfRecords[duration]}`
            : `https://api.octopus.energy/v1/products/${tariff}/`,
        };
      })
    ),
  });
  return query;
}

export default useTariffQuery;
