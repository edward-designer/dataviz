"use client";
import { UserContext } from "@/context/user";
import { ENERGY_TYPE, ETARIFFS, GTARIFFS, gsp } from "@/data/source";
import { getCategory } from "@/utils/helpers";
import { useQueries } from "@tanstack/react-query";
import { useContext } from "react";
import createTariffQuery from "../utils/createTariffQuery";
import useConsumptionData from "./useConsumptionData";
import usePriceCapQuery from "./usePriceCapQuery";

interface IMeterData {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

interface IDailyResult {
  reading: number;
  cost: number;
  SVTcost: number;
  standingCharge: number;
  SVTstandingCharge: number;
}

interface ICaps {
  Region: gsp;
  Date: string;
  E: number;
  G: number;
  ES: number;
  GS: number;
}

export type IDailyAmountCalculation = {
  type: "E" | "G" | "EE";
  periodWithTariff: {
    date: Date;
    tariff: string;
  }[];
  deviceNumber: string;
  serialNo: string;
  gsp: string;
  compareTo?: string;
  apiKey: string;
  dual?: boolean;
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
    dual = false,
  } = inputs;

  const { value } = useContext(UserContext);

  const fromISODate = periodWithTariff.at(0)!.date.toISOString();
  const lastDateStart = periodWithTariff.at(-1)!.date;

  const todayDate = new Date();
  todayDate.setHours(23, 59, 59, 999);
  todayDate.setDate(todayDate.getDate() - 1);

  const toISODate =
    lastDateStart.valueOf() > todayDate.valueOf()
      ? todayDate.toISOString()
      : new Date(
          new Date(lastDateStart).setHours(23, 59, 59, 999)
        ).toISOString();

  const uniqueTariffCodes: string[] = [];

  const SVTtariff =
    type === "E"
      ? ETARIFFS.find((tariff) => tariff.category === "SVT")?.tariff
      : type === "G"
      ? GTARIFFS.find((tariff) => tariff.category === "SVT")?.tariff
      : null;

  if (SVTtariff) uniqueTariffCodes.push(SVTtariff);

  periodWithTariff.forEach(({ tariff }) => {
    if (!uniqueTariffCodes.includes(tariff) && tariff !== "")
      uniqueTariffCodes.push(tariff);
  });

  const typeEorG = type === "EE" ? "E" : type;

  // get readings
  const {
    data: meterData,
    isSuccess,
    isLoading,
  } = useConsumptionData({
    fromISODate: fromISODate,
    toISODate: toISODate,
    type: typeEorG,
    category: "Agile",
    deviceNumber,
    serialNo,
    apiKey,
  });

  // if data is not available for the last (few) dates
  const latestDateWithReading = meterData?.results?.at(0)?.interval_start;
  if (latestDateWithReading) {
    while (
      new Date(latestDateWithReading).getUTCDate() !==
      new Date(periodWithTariff.at(-1)!.date).getUTCDate()
    ) {
      periodWithTariff.pop();
    }
  }

  // get standing charges
  const queryFnStandingChargeData = (tariff: string) => async () => {
    try {
      const response = await fetch(
        `https://api.octopus.energy/v1/products/${tariff}/${
          ENERGY_TYPE[typeEorG]
        }-tariffs/${typeEorG}-${
          dual ? "2" : "1"
        }R-${tariff}-${gsp}/standing-charges/?page_size=1500&period_from=${fromISODate.replace(
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
      type: typeEorG,
      gsp,
      fromDate: fromISODate,
      toDate: toISODate,
      category: getCategory(tariff),
      enabled: !!tariff,
      dual,
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

  /* OFGEM caps */
  const currentGSP = `_${gsp}` as gsp;
  const caps = usePriceCapQuery({ gsp: currentGSP });
  const capsCurrentCSP = caps.data?.filter(
    (cap) => cap.Region === currentGSP
  ) as ICaps[] | undefined;

  if (meterData?.results) {
    const meterDataResult = meterData.results as IMeterData[];

    const dailyResultArray = periodWithTariff.map(({ date, tariff }) => {
      const periodFrom = date;
      const periodTo = new Date(new Date(date).setDate(date.getDate() + 1));
      const tariffIndexInArray = uniqueTariffCodes.findIndex(
        (tariffCode) => tariffCode === tariff
      );
      const tariffRates = dual
        ? ([
            ...resultsWithUnitAndStandardCharge[tariffIndexInArray * 2]
              ?.data?.[0]?.results,
            ...resultsWithUnitAndStandardCharge[tariffIndexInArray * 2]
              ?.data?.[1]?.results,
          ] as ITariffResults[])
        : (resultsWithUnitAndStandardCharge[tariffIndexInArray * 2]?.data?.[0]
            ?.results as ITariffResults[]);

      const tariffStandingCharges = resultsWithUnitAndStandardCharge[
        tariffIndexInArray * 2 + 1
      ]?.data?.results as ITariffResults[];
      const SVTrates = resultsWithUnitAndStandardCharge[0].data?.[0]
        ?.results as ITariffResults[];
      const SVTstandingCharges = resultsWithUnitAndStandardCharge[1]?.data
        ?.results as ITariffResults[];
      const dailyResults = calculateDailyResults({
        type,
        periodFrom,
        periodTo,
        tariffRates: tariffRates.filter(
          (tariff) => tariff.payment_method !== "NON_DIRECT_DEBIT"
        ),
        tariffStandingCharges,
        meterData: meterDataResult.filter(
          (d) =>
            new Date(d.interval_start).valueOf() >= periodFrom.valueOf() &&
            new Date(d.interval_start).valueOf() < periodTo.valueOf()
        ),
        SVTrates,
        SVTstandingCharges,
        cap: capsCurrentCSP,
        gasConversionFactor: value.gasConversionFactor,
        tariff,
        dual,
      });
      return dailyResults;
    });
    return {
      isLoading: false,
      isSuccess: true,
      results: dailyResultArray,
    };
  } else {
    return { isLoading: true, isSuccess: false, results: null };
  }
};

export default useDailyAmountCalculation;

interface ICalculateDailyResults {
  type: "E" | "G" | "EE";
  periodFrom: Date;
  periodTo: Date;
  meterData: IMeterData[];
  gasConversionFactor: number;
  tariffRates: ITariffResults[];
  tariffStandingCharges: ITariffResults[];
  SVTrates: ITariffResults[];
  SVTstandingCharges: ITariffResults[];
  cap: ICaps[] | undefined;
  tariff: string;
  dual?: boolean;
}

interface ITariffResults {
  value_inc_vat: number;
  valid_from: string;
  valid_to: string | null;
  payment_method: string | null;
}

export const calculateDailyResults = ({
  type,
  periodFrom,
  periodTo,
  meterData,
  gasConversionFactor,
  tariffRates,
  tariffStandingCharges,
  SVTrates,
  SVTstandingCharges,
  cap,
  tariff,
  dual = false,
}: ICalculateDailyResults) => {
  const consumptionMultiplier = type === "G" ? gasConversionFactor : 1;

  const reading = meterData?.reduce(
    (acc, cur) => cur.consumption * consumptionMultiplier + acc,
    0
  );

  const SVTrate = SVTrates?.find(
    (tariff) =>
      new Date(tariff.valid_from).valueOf() <= periodFrom.valueOf() &&
      (tariff.valid_to === null ||
        new Date(tariff.valid_to).valueOf() >= periodTo.valueOf() - 3600000)
  )?.value_inc_vat;

  //const capRate = type === "EE" ? Infinity : cap?.[0][type] ?? Infinity;

  const SVTcost = SVTrate ? reading * SVTrate : undefined;
  const SVTstandingCharge = SVTstandingCharges?.find(
    (tariff) =>
      new Date(tariff.valid_from).valueOf() <= periodFrom.valueOf() &&
      (tariff.valid_to === null ||
        new Date(tariff.valid_to).valueOf() >= periodTo.valueOf()) &&
      tariff.payment_method !== "NON_DIRECT_DEBIT"
  )?.value_inc_vat;

  const standingCharge = tariffStandingCharges?.find(
    (tariff) =>
      new Date(tariff.valid_from).valueOf() <= periodFrom.valueOf() &&
      (tariff.valid_to === null ||
        new Date(tariff.valid_to).valueOf() >= periodTo.valueOf() - 3600000)
  )?.value_inc_vat;

  const sessionCosts = [];
  const cost: number = meterData?.reduce((acc, cur) => {
    if (dual) {
      const currentSessionRateEntry = tariffRates?.filter(
        (tariff) =>
          new Date(tariff.valid_from) <= new Date(cur.interval_start) &&
          (tariff.valid_to === null ||
            new Date(tariff.valid_to) >= new Date(cur.interval_end))
      );
      const peakTariff = currentSessionRateEntry[0];
      const offpeakTariff = currentSessionRateEntry[1];
      const startHour = new Date(cur.interval_start).getUTCHours();
      // 0 - 7 offpeak
      const currentRateEntry = startHour < 7 ? offpeakTariff : peakTariff;
      if (currentRateEntry !== undefined && acc !== null) {
        sessionCosts.push(currentRateEntry.value_inc_vat);
        return (
          acc +
          cur.consumption *
            consumptionMultiplier *
            currentRateEntry.value_inc_vat
        );
      } else {
        throw new Error("Error calculating");
      }
    } else {
      const currentSessionRate = tariffRates?.find(
        (tariff) =>
          new Date(tariff.valid_from) <= new Date(cur.interval_start) &&
          (tariff.valid_to === null ||
            new Date(tariff.valid_to) >= new Date(cur.interval_end))
      )?.value_inc_vat;
      if (currentSessionRate !== undefined && acc !== null) {
        sessionCosts.push(currentSessionRate);
        return (
          acc + cur.consumption * consumptionMultiplier * currentSessionRate
        );
      } else {
        throw new Error("Error calculating");
      }
    }
  }, 0);

  if (
    SVTcost === undefined ||
    SVTstandingCharge === undefined ||
    standingCharge === undefined ||
    cost === undefined ||
    reading === undefined
  ) {
    throw new Error("Error calculating");
  }

  return {
    reading,
    cost,
    SVTcost,
    standingCharge,
    SVTstandingCharge,
    tariff,
  };
};
