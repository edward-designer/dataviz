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

import { fetchApi, getCategory } from "../utils/helpers";

function useTariffQuery<T>({
  tariff,
  type,
  gsp,
  duration = "month",
  dual = false,
}: {
  tariff: string;
  type: TariffType;
  gsp?: string;
  duration?: DurationType;
  dual?: boolean;
}): UseQueryResult<T[], Error> {
  const queryClient = useQueryClient();
  const category = getCategory(tariff);
  const typeArr = type
    .split("")
    .filter((type: string) => type === "E" || type === "G") as ApiTariffType[];

  const noByCategory = {
    Go: {
      month: 240,
      "2-days": 12,
    },
    IGo: {
      month: 240,
      "2-days": 12,
    },
    Cosy: {
      month: 240,
      "2-days": 12,
    },
    Agile: {
      month: 1500,
      "2-days": 96,
    },
    Tracker: {
      month: 1500,
      "2-days": 96,
    },
    SVT: {
      month: 1500,
      "2-days": 96,
    },
    Fixed: {
      month: 1500,
      "2-days": 96,
    },
    Chart: {
      month: 1500,
      "2-days": 96,
    },
    Flux: {
      month: 1500,
      "2-days": 96,
    },
    IFlux: {
      month: 1500,
      "2-days": 96,
    },
  };
  const dualCode = dual ? "2R" : "1R";
  const noOfRecords = {
    month: noByCategory[category]["month"],
    week: 336,
    "2-days": noByCategory[category]["2-days"],
    day: 48,
    year: 44800,
  };
  // only need to fetch once
  if (!gsp) typeArr.length = 1;
  const query = useQuery<T[]>({
    enabled: !!tariff,
    queryKey: ["getTariff", tariff, type, gsp, duration],
    queryFn:
      dual && gsp
        ? fetchApi([
            {
              tariffType: "E",
              url: `https://api.octopus.energy/v1/products/${tariff}/electricity-tariffs/${type}-${dualCode}-${tariff}-${gsp}/day-unit-rates/?page_size=${noOfRecords[duration]}`,
            },
            {
              tariffType: "E",
              url: `https://api.octopus.energy/v1/products/${tariff}/electricity-tariffs/${type}-${dualCode}-${tariff}-${gsp}/night-unit-rates/?page_size=${noOfRecords[duration]}`,
            },
          ])
        : fetchApi(
            typeArr.map((type) => {
              return {
                tariffType: type,
                url: gsp
                  ? `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-${dualCode}-${tariff}-${gsp}/standard-unit-rates/?page_size=${noOfRecords[duration]}`
                  : `https://api.octopus.energy/v1/products/${tariff}/`,
              };
            })
          ),
  });
  return query;
}

export default useTariffQuery;
