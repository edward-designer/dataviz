import {
  ApiTariffType,
  TariffResult,
  FETCH_ERROR,
  QueryTariffResult,
  gsp,
  TariffCategory,
  IConsumptionData,
  ITariffToCompare,
} from "@/data/source";

import { BaseType, Selection, select, timeDays } from "d3";
import { ReactNode } from "react";

export const fetchEachApi = async ({
  tariffType,
  gsp,
  url,
  tag,
}: {
  tariffType?: ApiTariffType;
  gsp?: gsp;
  url: string;
  tag?: string;
}) => {
  const response = await tryFetch(fetch(url, { cache: "no-store" }));
  if (response.status !== 200) {
    return { success: false };
  }
  if (!response.ok) throw new Error(FETCH_ERROR);
  const json = await response.json();
  json.dataStamp = new Date().toLocaleDateString("en-GB");
  return { success: true, ...json, tariffType, gsp, tag };
};

export const fetchApi =
  (
    urls: { tariffType?: ApiTariffType; url: string; gsp?: gsp; tag?: string }[]
  ) =>
  async () => {
    const allResponse = await Promise.allSettled(
      urls.map((url) =>
        fetchEachApi({
          tariffType: url.tariffType,
          url: url.url,
          gsp: url.gsp,
          tag: url.tag,
        })
      )
    );
    const result = allResponse.flatMap((response) => {
      if (response.status === "fulfilled" && response.value.success)
        return response.value;
    });
    return result.filter(Boolean);
  };

// in summer time the valid from time is from 23:00 of previous day
export const adjustedValidFrom = (valid_from: string) => {
  const adjusted_valid_from = new Date(valid_from);
  adjusted_valid_from.setHours(adjusted_valid_from.getHours() + 2);
  return adjusted_valid_from;
};

export const isSameDate = (date1: Date, date2: Date) => {
  const date1AtMidnight = new Date(
    Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate())
  );
  const date2AtMidnight = new Date(
    Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate())
  );
  return date1AtMidnight.getTime() === date2AtMidnight.getTime();
};

export const isToday = (date: Date) => isSameDate(new Date(), date);
export const isTomorrow = (date: Date) =>
  isSameDate(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), date);

export const priceAccessor = (
  data: TariffResult | TariffResult[],
  index: number = 0
): undefined | number => {
  const value = Array.isArray(data)
    ? data.at(index)?.value_inc_vat
    : data?.value_inc_vat;
  if (typeof value === "undefined") return;
  return evenRound(value, 2);
};

// Octopus uses unbiased rounding
export function evenRound(num: number): number;
export function evenRound(num: number, decimalPlaces: number): number;
export function evenRound(
  num: number,
  decimalPlaces: number,
  padZero: boolean
): string;
export function evenRound(
  num: number,
  decimalPlaces: number = 2,
  padZero: boolean = false
): any {
  const d = decimalPlaces || 0;
  const m = Math.pow(10, d);
  const n = +(d ? num * m : num).toFixed(8);
  const i = Math.floor(n),
    f = n - i;
  const e = 1e-8;
  const r =
    f > 0.5 - e && f < 0.5 + e ? (i % 2 == 0 ? i : i + 1) : Math.round(n);
  const returnValue = d ? r / m : r;
  return padZero ? returnValue.toFixed(2) : returnValue;
}

export const formatNumberToDisplay = (n: number) => {
  if (Math.abs(n) > 10) return evenRound(n, 0);
  return evenRound(n, 2);
};

export const calculateChangePercentage = (
  price: unknown,
  priceToCompare: unknown
): number | boolean => {
  if (
    typeof price !== "number" ||
    typeof priceToCompare !== "number" ||
    price === 0 ||
    priceToCompare === 0
  )
    return false;
  return parseInt(
    (((price - priceToCompare) / priceToCompare) * 100).toFixed(0)
  );
};

export const addSign = (price: number) => {
  if (price > 0) return `+${price}`;
  return String(price);
};

export const formatPriceChangeWithSign = (
  price: number,
  positiveSign: boolean = true
) => {
  const trimmedPrice = formatNumberToDisplay(price);
  if (trimmedPrice === 0) return `-`;
  if (price > 0) return `${positiveSign ? "+" : ""}£${trimmedPrice}`;
  if (price < 0) return `-£${-1 * trimmedPrice}`;
  return "-";
};

export function assertExtentNotUndefined<T>(
  extent: Array<T | undefined>
): asserts extent is [T, T] {
  if (!!extent.find((element) => typeof element === "undefined"))
    throw new Error("some element is undefined");
}

export const tryFetch = async <T extends Response>(
  asyncProcess: Promise<T>
) => {
  try {
    const results = await asyncProcess;
    return results;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw new Error(error.message);
    }
    throw new Error(FETCH_ERROR);
  }
};

export const selectOrAppend = (
  element: "g" | "rect" | "circle" | "text" | "line" | "polygon" | "path",
  className: string,
  parentNode: Selection<SVGSVGElement | SVGGElement, unknown, null, undefined>
) => {
  if (!element) throw new Error("Element must be specified.");
  const node = parentNode.select(`${element}.${className}`).node()
    ? parentNode.select(`${element}.${className}`)
    : parentNode.append(element).classed(className, true);
  return node;
};

export const formatLocaleTime = (time: string) =>
  new Date(time).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatLocaleTimePeriod = (fromTime: string, toTime: string) =>
  `${formatLocaleTime(fromTime)} - ${formatLocaleTime(toTime)}`;

export const getGsp = async (postcode: string): Promise<false | string> => {
  const response = await tryFetch(
    fetch(
      `https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=${postcode}`
    )
  );
  if (!response.ok) throw new Error(FETCH_ERROR);

  const result = await response.json();
  const gsp = result?.results?.[0]?.group_id;
  if (!result.count || typeof gsp !== "string") {
    return false;
  }
  return gsp;
};

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;

export const range = (start: number, end?: number, step: number = 1) => {
  let output = [];
  if (typeof end === "undefined") {
    end = start;
    start = 0;
  }
  for (let i = start; i < end; i += step) {
    output.push(i);
  }
  return output;
};

export const capitalize = (word: string) =>
  word.replace(new RegExp(/^[a-z]{1}/), (match) => match.toUpperCase());

export const toNextTen = (value: number) => Math.ceil(value / 10) * 10;

export const delay = (time: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export const animateNumber = async (
  numberArr: number[],
  time: number,
  selection: Selection<SVGTextElement, unknown, null, undefined>
) => {
  const startTime = new Date().getTime();
  for (let i = 0; i < numberArr.length; i++) {
    const remainingTime = time - (new Date().getTime() - startTime);
    const interval = remainingTime / (numberArr.length - i);
    selection.text(String(evenRound(numberArr[i], 0)).padStart(5, "0"));
    await delay(interval);
  }
};

export const getCategory = (tariff: string): TariffCategory => {
  if (tariff.includes("AGILE")) return "Agile";
  if (tariff.includes("SILVER")) return "Tracker";
  if (tariff.includes("FIX")) return "Fixed";
  if (tariff.includes("COSY")) return "Cosy";
  if (tariff.includes("INTELLI-FLUX")) return "IFlux";
  if (tariff.includes("FLUX")) return "Flux";
  if (tariff.includes("GO")) return "Go";
  if (tariff.includes("INTELLI")) return "IGo";
  if (tariff.includes("VAR")) return "SVT";
  return "Chart";
};

export type TariffName =
  | "Agile"
  | "Tracker"
  | "Fixed"
  | "Cosy"
  | "Flux"
  | "IFlux"
  | "Go"
  | "IGo"
  | "Variable"
  | "Super Green";

export const getTariffName = (tariff: string): TariffName => {
  const tariffName = getCategory(tariff);
  return tariffName === "SVT"
    ? "Variable"
    : tariffName === "Chart"
    ? "Super Green"
    : tariffName;
};

export const fillMissingDays = (results: IConsumptionData[]) => {
  if (!results) return;
  if (results[0]?.interval_start && results.at(-1)?.interval_start) {
    const filledResults = timeDays(
      new Date(results.at(-1)!.interval_start),
      new Date(results[0].interval_start)
    ).map((time) => ({
      consumption:
        results.find((d) => {
          const currentDay = new Date(d.interval_start);
          currentDay.setHours(0, 0, 0, 0);
          return currentDay.valueOf() === time.valueOf();
        })?.consumption ?? 0,
      interval_start: time.toUTCString(),
      interval_end: time.toUTCString(),
    }));
    filledResults.reverse();
    return filledResults;
  }
  return results;
};

export type TDuration = "year" | "month" | "week" | "day";
export const getDate = (
  date: Date,
  duration: TDuration = "year",
  earlier = true
) => {
  const newDate = new Date(date);
  newDate.setUTCHours(0, 0, 0, 0);
  switch (duration) {
    case "year":
      return new Date(
        newDate.setFullYear(
          earlier ? newDate.getUTCFullYear() - 1 : newDate.getUTCFullYear() + 1
        )
      );
    case "month":
      return new Date(
        newDate.setUTCMonth(
          earlier ? newDate.getUTCMonth() - 1 : newDate.getUTCMonth() + 1
        )
      );
    case "week":
      return new Date(
        newDate.setUTCDate(
          earlier ? newDate.getUTCDate() - 7 : newDate.getUTCDate() + 7
        )
      );
    default:
    case "day":
      return new Date(
        newDate.setUTCDate(
          earlier ? newDate.getUTCDate() - 1 : newDate.getUTCDate() + 1
        )
      );
  }
};

export const outOfAYear = (date: Date, from = true) => {
  const yesterday = new Date(
    new Date(new Date().setUTCHours(0, 0, 0, 0)).setUTCDate(
      new Date().getUTCDate() - 1
    )
  );
  const oneYearEarlier = new Date(
    new Date(new Date().setUTCHours(0, 0, 0, 0)).setUTCFullYear(
      new Date().getUTCFullYear() - 1
    )
  );
  return from
    ? date.valueOf() <= oneYearEarlier.valueOf()
    : date.valueOf() >= yesterday.valueOf();
};

export const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
  );
};

export const daysDiff = (dateFrom: Date, dateTo: Date): number => {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;
  const date1 = dateFrom;
  const date2 = dateTo;
  const timeDiff = date2.valueOf() - date1.valueOf();
  const dayDiff = Math.ceil(timeDiff / day);
  return dayDiff;
};

export const dateDiff = (dateFrom: Date, dateTo: Date): string => {
  const second = 1000,
    minute = second * 60,
    hour = minute * 60,
    day = hour * 24;
  const date1 = dateFrom;
  const date2 = dateTo;
  const timeDiff = date2.valueOf() - date1.valueOf();
  const yearDiff = Math.floor(timeDiff / (day * 365));
  const monthDiff =
    date2.getFullYear() * 12 +
    date2.getMonth() -
    (date1.getFullYear() * 12 + date1.getMonth());
  const dayDiff = Math.floor(timeDiff / day);
  if (yearDiff > 0)
    return `Amazing! You have been a loyal Octopus customer for ${yearDiff} ${
      yearDiff === 1 ? "year" : "years"
    }.`;
  if (monthDiff > 0)
    return `Awesome! You have been with Octopus for ${monthDiff} ${
      monthDiff === 1 ? "month" : "months"
    }.`;
  if (dayDiff > 0)
    return `Hi there, you have been onboard Octopus for ${dayDiff} ${
      dayDiff === 1 ? "day" : "days"
    }!`;
  return "Welcome to the Octopus family!";
};

export const getDatePeriod = (duration: TDuration = "year") => {
  const today = new Date();
  const from = getDate(today, duration, true);
  const to = getDate(getDate(from, duration, false), "day", true);
  to.setHours(23, 59, 59, 999);
  return {
    duration,
    from,
    to,
  };
};

export const getAllTariffsWithCurrentTariff = (
  TariffGroup: ITariffToCompare[],
  currentTariff: string
) => {
  const tariffs = [...TariffGroup];
  if (
    currentTariff &&
    !tariffs.some((tariff) => tariff.tariff === currentTariff)
  )
    tariffs.push({
      tariff: currentTariff,
      type: "E",
      category: getCategory(currentTariff),
      cost: null,
    });
  return tariffs;
};

export const calculateSimTotal = (
  readingByTime: number[] | undefined,
  rateByTime: number[] | undefined,
  numOfDays: number
) =>
  readingByTime && rateByTime
    ? (readingByTime.reduce((acc, cur, i) => cur * rateByTime[i] + acc, 0) *
        numOfDays) /
      100
    : undefined;

export const checkGoodBadTime = (
  isExport: boolean,
  category: string,
  price: number | undefined,
  avgPrice: number | undefined
) => {
  if (price === undefined || avgPrice === undefined) return "";
  const compareFactor = category === "Agile" ? 1.3 : 1.1;
  if (isExport) {
    if (price > avgPrice * compareFactor) return "good";
    if (price < avgPrice / compareFactor) return "bad";
  }
  if (price > avgPrice * compareFactor) return "bad";
  if (price < avgPrice / compareFactor) return "good";

  return "";
};

export const getUnderlyingTariff = (tariff: string) => {
  const underlyingTariff =
    getCategory(tariff) === "Agile"
      ? "AGILE-FLEX-22-11-25"
      : getCategory(tariff) === "Tracker"
      ? "SILVER-FLEX-22-11-25"
      : tariff;
  return underlyingTariff;
};

export const getTariffCodeWithoutPrefixSuffix = (
  fullTariffCode: string
): string => {
  if (fullTariffCode.startsWith("E-") || fullTariffCode.startsWith("G-")) {
    const cutOffFromBeginningPos = fullTariffCode.indexOf("-", 2);
    const lastHyphenPos = fullTariffCode.lastIndexOf("-");
    const cutOffFromEndPost =
      lastHyphenPos === fullTariffCode.length - 2 ? lastHyphenPos : 0;
    return fullTariffCode.substring(
      cutOffFromBeginningPos + 1,
      cutOffFromEndPost
    );
  }
  return fullTariffCode;
};

export const toLocaleUTCDateString = (date: Date, locales: string) => {
  const timeDiff = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.valueOf() + timeDiff);
  return adjustedDate.toLocaleDateString(locales);
};
