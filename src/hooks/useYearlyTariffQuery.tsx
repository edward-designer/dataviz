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
  TariffCategory,
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

function useYearlyTariffQuery<T>({
  tariff,
  type,
  gsp,
  fromDate,
  toDate,
  category,
  enabled = true,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp?: string;
  fromDate: string;
  toDate: string;
  category: TariffCategory;
  enabled: boolean;
}): UseQueryResult<T[], Error> {
  const queryClient = useQueryClient();

  const numberOfPages = Math.ceil(
    (((new Date(toDate).valueOf() - new Date(fromDate).valueOf()) /
      1000 /
      60 /
      60) *
      2) /
      1500
  );
  const agilePageArray = Array.from({ length: numberOfPages }, (_, i) => i + 1);
  const queryFnArray = {
    Chart: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`,
      },
    ]),
    Agile: fetchApi(
      agilePageArray.map((num) => {
        return {
          tariffType: type,
          url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}&page=${num}`,
        };
      })
    ),
    Go: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`,
      },
    ]),
    Cosy: fetchApi(
      [1, 2].map((num) => {
        return {
          tariffType: type,
          url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}&page=${num}`,
        };
      })
    ),
    Tracker: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`,
      },
    ]),
    SVT: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`,
      },
    ]),
    Fixed: fetchApi([
      {
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500&period_from=${fromDate}&period_to=${toDate}`,
      },
    ]),
  };

  const query = useQuery<T[]>({
    enabled,
    queryKey: ["getYearlyTariff", tariff, type, gsp],
    queryFn: queryFnArray[category],
  });
  return query;
}

export default useYearlyTariffQuery;
