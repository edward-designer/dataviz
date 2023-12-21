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
    year: 1500,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDay = new Date(new Date().setDate(new Date().getDate() + 1));
  nextDay.setHours(0, 0, 0, 0);

  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getCheapestTariff", tariff, plan, type],
    queryFn: fetchApi(
      plan === `tracker`
        ? [
            {
              tag: `${plan} - ${type}`,
              url: gsp
                ? `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=${noOfRecords[duration]}`
                : `https://api.octopus.energy/v1/products/${tariff}/`,
            },
          ]
        : GSP.map((code) => {
            return {
              tag: plan,
              url: `https://api.octopus.energy/v1/products/${tariff}/electricity-tariffs/E-1R-${tariff}-${code.replace(
                "_",
                ""
              )}/standard-unit-rates/?page_size=96&period_from=${today.toISOString()}&period_to=${nextDay.toISOString()}`,
            };
          })
    ),
  });
  return query;
}
// https://api.octopus.energy/v1/products/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-A/standard-unit-rates/

export default useCheapestTariffQuery;
