import {
  ApiTariffType,
  TariffResult,
  FETCH_ERROR,
  QueryTariffResult,
  gsp,
  TariffCategory,
  IConsumptionData,
} from "@/data/source";

import { BaseType, Selection, select, timeDays } from "d3";

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
  if (!response.ok) throw new Error(FETCH_ERROR);
  const json = await response.json();
  json.dataStamp = new Date().toLocaleDateString();
  return { ...json, tariffType, gsp, tag };
};

export const fetchApi =
  (
    urls: { tariffType?: ApiTariffType; url: string; gsp?: gsp; tag?: string }[]
  ) =>
  async () => {
    const allResponse = await tryFetch(
      Promise.all(
        urls.map((url) =>
          fetchEachApi({
            tariffType: url.tariffType,
            url: url.url,
            gsp: url.gsp,
            tag: url.tag,
          })
        )
      )
    );
    return allResponse;
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

export function assertExtentNotUndefined<T>(
  extent: Array<T | undefined>
): asserts extent is [T, T] {
  if (!!extent.find((element) => typeof element === "undefined"))
    throw new Error("some element is undefined");
}

export const tryFetch = async <T>(asyncProcess: Promise<T>) => {
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
  new Date(time).toLocaleTimeString([], {
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
  if (tariff.includes("FLUX")) return "Flux";
  if (tariff.includes("GO")) return "Go";
  if (tariff.includes("INTELLI")) return "Go";
  if (tariff.includes("VAR")) return "SVT";
  return "Chart";
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
