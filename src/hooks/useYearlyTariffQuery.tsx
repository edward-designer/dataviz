"use client";
import {
  UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ENERGY_TYPE, TariffCategory, TariffType } from "@/data/source";
import createTariffQuery from "@/utils/createTariffQuery";

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
  const queryFn = createTariffQuery({
    tariff,
    type,
    gsp,
    fromDate,
    toDate,
    category,
    enabled,
  });

  const query = useQuery<T[]>({
    enabled,
    queryKey: ["getYearlyTariff", tariff, type, gsp, fromDate, toDate],
    queryFn,
  });
  return query;
}

export default useYearlyTariffQuery;
