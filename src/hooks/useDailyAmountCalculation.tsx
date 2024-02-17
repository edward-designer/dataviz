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
import { evenRound, fetchApi, getCategory, getDate } from "@/utils/helpers";
import { QueryKey, useQueries, useQuery } from "@tanstack/react-query";
import usePriceCapQuery from "./usePriceCapQuery";
import useConsumptionData from "./useConsumptionData";
import createTariffQuery from "../utils/createTariffQuery";
import { useContext } from "react";

interface meterData {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

export type IDailyAmountCalculation = {
  type: "E" | "G";
  periodWithTariff: {
    date: Date;
    tariff: string;
  }[];
  deviceNumber: string;
  serialNo: string;
  gsp: string;
  compareTo?: string;
  apiKey: string;
};

const useDailyAmountCalculation = (inputs: IDailyAmountCalculation) => {
  const {
    type,
    periodWithTariff,
    deviceNumber,
    serialNo,
    gsp,
    compareTo = "SVT",
    apiKey,
  } = inputs;

  const { value } = useContext(UserContext);

  // avoid unnecessary refetching of meter data if range is narrower
  const fromISODate = periodWithTariff.at(0)!.date.toISOString();
  const toISODate = periodWithTariff.at(-1)!.date.toISOString();

  const fromDataISODate = getDate(new Date(), "year", true).toISOString();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const toDataISODate = todayDate.toISOString();

  const uniqueTariffCodes: string[] = [periodWithTariff.at(0)!.tariff];
  periodWithTariff.forEach(({ tariff }) => {
    if (!uniqueTariffCodes.includes(tariff)) uniqueTariffCodes.push(tariff);
  });

  // get readings
  const {
    data: meterData,
    isSuccess,
    isLoading,
  } = useConsumptionData({
    fromISODate: fromISODate,
    toISODate: toISODate,
    type,
    category: "Agile",
    deviceNumber,
    serialNo,
    apiKey,
  });

  // get standing charges
  const queryFnStandingChargeData = (tariff: string) => async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${
          ENERGY_TYPE[type]
        }-tariffs/${type}-1R-${tariff}-${gsp}/standing-charges/?page_size=1500&period_from=${fromISODate.replace(
          ".000",
          ""
        )}`
      );
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  // get rates
  const rateQueries = uniqueTariffCodes.map((tariff) => {
    const queryFn = createTariffQuery({
      tariff,
      type,
      gsp,
      fromDate: fromISODate,
      toDate: toISODate,
      category: getCategory(tariff),
      enabled: !!tariff,
    });
    return [
      {
        queryKey: [
          "getYearlyTariff",
          tariff,
          type,
          gsp,
          fromISODate,
          toISODate,
        ],
        queryFn: queryFn,
      },
      {
        queryKey: [
          "getStandingCharge",
          tariff,
          type,
          gsp,
          fromISODate,
          toISODate,
        ],
        queryFn: queryFnStandingChargeData(tariff),
      },
    ];
  });

  const resultsWithUnitAndStandardCharge = useQueries({
    queries: rateQueries.flat(),
  });

  const currentGSP = `_${gsp}` as gsp;
  const caps = usePriceCapQuery({ gsp: currentGSP });

  if (meterData?.results) {
    const meterDataResult = meterData.results as meterData[];

    return periodWithTariff.map(({ date, tariff }) => {
      const periodFrom = date;
      const periodTo = new Date(date.setHours(date.getHours() + 24));
      const tariffIndexInArray = uniqueTariffCodes.findIndex(
        (tariffCode) => tariffCode === tariff
      );
      const tariffRates =
        resultsWithUnitAndStandardCharge[tariffIndexInArray].data.results;
      const tariffStandingCharges =
        resultsWithUnitAndStandardCharge[tariffIndexInArray + 1].data.results;
      const dailyResults = calculateDailyResults({
        type,
        periodFrom,
        periodTo,
        tariffRates,
        tariffStandingCharges,
        meterData: meterDataResult.filter(
          (d) =>
            new Date(d.interval_start).valueOf() >= periodFrom.valueOf() &&
            new Date(d.interval_start).valueOf() < periodTo.valueOf()
        ),
        gasConversionFactor: value.gasConversionFactor,
      });

      return dailyResults;
    });
  } else {
    return { isLoading: true };
  }
};

export default useDailyAmountCalculation;

interface ICalculateDailyResults {
  type: "E" | "G";
  periodFrom: Date;
  periodTo: Date;
  meterData: meterData[];
  gasConversionFactor: number;
  tariffRates: unknown;
  tariffStandingCharges: unknown;
}

export const calculateDailyResults = ({
  type,
  periodFrom,
  periodTo,
  meterData,
  gasConversionFactor,
  tariffRates,
  tariffStandingCharges,
}: ICalculateDailyResults) => {
  const consumptionMultiplier = type === "G" ? gasConversionFactor : 1;

  return {
    reading: 0,
    cost: 0,
    SVTcost: 0,
    standingCharge: 0,
    SVTstandingCharge: 0,
  };
};
