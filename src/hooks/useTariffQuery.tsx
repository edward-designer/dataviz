"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ENERGY_TYPE,
  QueryTariffResult,
  TariffType,
  ApiTariffType,
} from "@/data/source";

import { fetchApi } from "../utils/helpers";

const useTariffQuery = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: TariffType;
  gsp: string;
}) => {
  const queryClient = useQueryClient();
  const typeArr = type
    .split("")
    .filter((type) => type === "E" || type === "G") as ApiTariffType[];
  const query = useQuery<QueryTariffResult[]>({
    queryKey: ["getTariff", tariff, type, gsp],
    queryFn: fetchApi(
      typeArr.map((type) => ({
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500`,
      }))
    ),
  });
  return query;
};

export default useTariffQuery;
