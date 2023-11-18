import { ascending, extent, sort, min, max } from "d3";
import { IData, IDataItem, useData } from "./useData";

export interface IGDPDataItem extends IDataItem {
  Variables: string;
  Geography: string;
  "Geography code": string;
  [key: string]: string;
}
export type IGDPData = IGDPDataItem[];

const includedKeys = ["Geography", "Geography code"];

function massagedData<T extends IGDPDataItem>(data: T[]): T[] {
  const filteredData = data.filter(
    (row) => row.Variables === "Gross domestic product at current market prices"
  );
  const returnData = filteredData.map((row) => {
    const filteredRow = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (!includedKeys.includes(key) && Number.isNaN(parseInt(key))) {
        delete filteredRow[key as keyof T];
      }
    }
    return filteredRow;
  });
  return returnData;
}

const useGDPDataBy = () => {
  const data = useData(
    "../gdp-by-local-authority-time-series-v2.csv"
  ) as IGDPData;
  if (!data) return;

  const returnData = massagedData<IGDPDataItem>(data);
  const lAExtent = returnData.map(
    (row) =>
      extent(Object.values(row), (value) => parseInt(value)) as [number, number]
  );
  const dataExtent = [
    min(lAExtent, (extent) => extent[0])!,
    max(lAExtent, (extent) => extent[1])!,
  ] as const;
  const yearArray = Object.keys(data[0])
    .filter((key) => typeof parseInt(key) === "number")
    .map((key) => parseInt(key));
  const yearExtent = extent(yearArray, (key) => key) as [number, number];

  console.log(dataExtent);

  return {
    data: returnData,
    yearRange: yearExtent,
    dataRange: dataExtent,
  };
};

export default useGDPDataBy;
