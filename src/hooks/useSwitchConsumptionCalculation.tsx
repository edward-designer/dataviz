"use client";
import { UserContext } from "@/context/user";
import {
  CapsTSVResult,
  ENERGY_TYPE,
  TariffCategory,
  TariffType,
  gsp,
} from "@/data/source";
import useYearlyTariffQuery from "@/hooks/useYearlyTariffQuery";
import { getDate } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import usePriceCapQuery from "./usePriceCapQuery";
import { ISwitchConsumptionData } from "@/components/octopus/SwitchTariffs";
import {
  calculateMonthlyPrices,
  calculatePrice,
} from "./useConsumptionCalculation";

export type IConsumptionCalculator = {
  tariff: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  consumptionData: ISwitchConsumptionData;
  results?: "monthly" | "90-day" | "yearly";
};

const useConsumptionCalculation = (inputs: IConsumptionCalculator) => {
  const { value } = useContext(UserContext);

  const {
    tariff,
    fromDate,
    toDate,
    type,
    category,
    consumptionData,
    results = "yearly",
  } = inputs;

  // avoid unnecessary refetching of consumption data if range is narrower
  const fromISODate = new Date(fromDate).toISOString();
  const toISODate = new Date(toDate).toISOString();

  const fromDataISODate = getDate(new Date(), "year", true).toISOString();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const toDataISODate = todayDate.toISOString();

  const queryFnStandingChargeData = async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${value.gsp}/standing-charges/?page_size=1500&period_from=${fromDataISODate}`
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const currentGSP = `_${value.gsp}` as gsp;
  const caps = usePriceCapQuery({ gsp: `_${value.gsp}` as gsp });

  const {
    data: rateData,
    isSuccess: isRateDataSuccess,
    isLoading: isRateDataLoading,
  } = useYearlyTariffQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: string;
      payment_method: null | string;
    }[];
  }>({
    tariff,
    type,
    gsp: value.gsp,
    fromDate: fromDataISODate,
    toDate: toDataISODate,
    category,
    enabled: true,
  });

  const {
    data: standingChargeData,
    isSuccess: isStandingChargeDataSuccess,
    isLoading: isStandingChargeDataLoading,
  } = useQuery<{
    results: {
      value_inc_vat: number;
      valid_from: string;
      valid_to: null | string;
      payment_method: null | string;
    }[];
  }>({
    queryKey: [
      "getStandingCharge",
      tariff,
      type,
      value.gsp,
      fromDataISODate,
      toDataISODate,
    ],
    queryFn: queryFnStandingChargeData,
    enabled: true,
  });

  const flattenedRateData = {
    results:
      rateData?.reduce(
        (
          acc: {
            value_inc_vat: number;
            valid_from: string;
            valid_to: string;
            payment_method: null | string;
          }[],
          monthlyRateData
        ) => {
          return [...acc, ...monthlyRateData.results];
        },
        []
      ) ?? [],
  };

  if (consumptionData?.results.length === 0) {
    return {
      cost: null,
      totalUnit: 0,
      totalPrice: 0,
      totalStandingCharge: 0,
      isLoading: false,
      lastDate: null,
      error:
        "Sorry, no consumption data available. Please try to select a different meter or try later.",
    };
  }

  if (isRateDataSuccess && isStandingChargeDataSuccess && caps.data) {
    if (results === "monthly") {
      const results = calculateMonthlyPrices(
        type,
        category,
        value.gasConversionFactor,
        fromISODate,
        toISODate,
        caps.data.filter((d) => d.Region === `_${value.gsp}`),
        consumptionData,
        flattenedRateData,
        standingChargeData,
        currentGSP
      );
      return results;
    } else {
      const results = calculatePrice(
        type,
        category,
        fromISODate,
        toISODate,
        value.gasConversionFactor,
        caps.data,
        consumptionData,
        flattenedRateData,
        [],
        standingChargeData,
        tariff === "SILVER-23-12-06",
        currentGSP
      );
      return results;
    }
  }
  return {
    cost: null,
    totalUnit: 0,
    totalPrice: 0,
    totalStandingCharge: 0,
    isLoading: isRateDataLoading,
    lastDate: null,
    error: "",
  };
};

export default useConsumptionCalculation;
