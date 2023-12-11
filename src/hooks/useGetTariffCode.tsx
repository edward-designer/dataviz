"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FETCH_ERROR, QueryProducts } from "@/data/source";

import { tryFetch } from "../utils/helpers";

function useGetTariffCode({
  queryParams = "brand=OCTOPUS_ENERGY&is_variable=true&is_prepay=false",
  displayName = "Flexible Octopus",
}: {
  queryParams?: string;
  displayName?: string;
}) {
  const queryClient = useQueryClient();
  const queryFn = async () => {
    const response = await tryFetch(
      fetch(`https://api.octopus.energy/v1/products/?${queryParams}`)
    );
    if (!response.ok) throw new Error(FETCH_ERROR);
    const json = (await response.json()) as QueryProducts;
    return {
      code:
        json.results.find((product) => product.display_name === displayName)
          ?.code ?? "",
    };
  };
  const query = useQuery<{ code: string }>({
    queryKey: ["getTariffCode", queryParams],
    queryFn,
  });
  return query;
}

export default useGetTariffCode;
