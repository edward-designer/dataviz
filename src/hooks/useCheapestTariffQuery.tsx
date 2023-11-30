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
  ENERGY_PLAN,
  GSP,
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

function useCheapestTariffQuery<T>({
  plan,
  type,
  gsp,
  duration = "month",
}: {
  plan: ENERGY_PLAN;
  type: Exclude<TariffType, "EG">;
  gsp?: string;
  duration?: DurationType;
}): UseQueryResult<T[], Error> {
  const tariff =
    plan === "tracker" ? "SILVER-FLEX-BB-23-02-08" : "AGILE-FLEX-22-11-25";

  const queryClient = useQueryClient();
  const noOfRecords = {
    month: 1500,
    week: 336,
    "2-days": 96,
    day: 48,
  };

  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getTariff", tariff, type, gsp, duration],
    queryFn: fetchApi(
      plan === "tracker"
        ? [
            {
              tariffType: type,
              url: gsp
                ? `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=${noOfRecords[duration]}`
                : `https://api.octopus.energy/v1/products/${tariff}/`,
            },
          ]
        : GSP.map((code) => {
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

export default useCheapestTariffQuery;
