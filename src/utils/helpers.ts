import {
  ApiTariffType,
  TariffResult,
  FETCH_ERROR,
  QueryTariffResult,
} from "@/data/source";

import { BaseType, Selection, select } from "d3";

export const fetchEachApi = async (tariffType: ApiTariffType, url: string) => {
  const response = await tryFetch(fetch(url, { cache: "no-store" }));
  if (!response.ok) throw new Error(FETCH_ERROR);
  const json = await response.json();
  json.dataStamp = new Date().toLocaleDateString();
  return { ...json, tariffType };
};

export const fetchApi =
  (urls: { tariffType: ApiTariffType; url: string }[]) => async () => {
    const allResponse = await tryFetch(
      Promise.all(urls.map((url) => fetchEachApi(url.tariffType, url.url)))
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
export const evenRound = (num: number, decimalPlaces: number) => {
  var d = decimalPlaces || 0;
  var m = Math.pow(10, d);
  var n = +(d ? num * m : num).toFixed(8);
  var i = Math.floor(n),
    f = n - i;
  var e = 1e-8;
  var r = f > 0.5 - e && f < 0.5 + e ? (i % 2 == 0 ? i : i + 1) : Math.round(n);
  return d ? r / m : r;
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
  element: "g" | "rect" | "circle" | "text",
  className: string,
  parentNode: Selection<SVGSVGElement, unknown, null, undefined>
) => {
  if (!element) throw new Error("Element must be specified.");
  const node = parentNode.select(`${element}.${className}`).node()
    ? parentNode.select(`${element}.${className}`)
    : parentNode.append(element).classed(className, true);
  return node;
};
