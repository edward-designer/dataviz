import {
  ApiTariffType,
  ENERGY_TYPE,
  TariffType,
  tariffResult,
} from "@/data/source";

export const fetchEachApi = async (tariffType: ApiTariffType, url: string) => {
  const response = await fetch(url);
  console.log(url);
  if (!response.ok) throw new Error("Cannot fetch data. Please try again.");
  const json = await response.json();
  return { ...json, tariffType };
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export const fetchApi =
  (urls: { tariffType: ApiTariffType; url: string }[]) => async () => {
    const results = await Promise.all(
      urls.map((url) => fetchEachApi(url.tariffType, url.url))
    );
    return results;
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
  data: tariffResult | tariffResult[],
  index: number = 0
) => {
  const value = Array.isArray(data)
    ? data.at(index)?.value_inc_vat
    : data?.value_inc_vat;
  if (typeof value === "undefined") return;
  return evenRound(value, 2);
};

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

export function assertExtentNotUndefined<T>(
  extent: Array<T | undefined>
): asserts extent is [T, T] {
  if (!!extent.find((element) => typeof element === "undefined"))
    throw new Error("some element is undefined");
}
