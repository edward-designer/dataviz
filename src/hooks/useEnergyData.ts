import { ascending, extent, sort } from "d3";
import { IData, IDataItem, useData } from "./useData";

/*
All_fuels_Domestic
: 
"96.85497525"
All_fuels_Industrial_Commercial_and_other
: 
"79.76981226"
All_fuels_Total
: 
"343.2255837"
All_fuels_Transport
: 
"166.6007962"
Bioenergy_and_wastes_Domestic
: 
"0.632482171"
Bioenergy_and_wastes_Industrial_and_Commercial
: 
"0.010262651"
Bioenergy_and_wastes_Road_transport
: 
"5.362318993"
Bioenergy_and_wastes_Total
: 
"6.005063815"
Coal_Agriculture
: 
"0.007369335"
Coal_Commercial
: 
"0.020783069"
Coal_Domestic
: 
"0.365807563"
Coal_Industrial
: 
"0.637767971"
Coal_Public_sector
: 
"0.575365543"
Coal_Rail
: 
"0"
Coal_Total
: 
"1.60709348"
Code
: 
"E07000197"
Electricity_Domestic
: 
"21.02572705"
Electricity_Industrial_Commercial_and_other
: 
"31.17551229"
Electricty_Total
: 
"52.20123934"
Gas_Domestic
: 
"64.2917472"
Gas_Industrial_Commercial_and_other
: 
"32.29535232"
Gas_Total
: 
"96.58709948"
LA
: 
"Stafford"
Manufactured_fuels_Domestic
: 
"0.302693367"
Manufactured_fuels_Industrial
: 
"0.000505448"
Manufactured_fuels_Total
: 
"0.303198815"
Petroleum_Agriculture
: 
"5.836537838"
Petroleum_Commercial
: 
"0.22194095"
Petroleum_Domestic
: 
"10.23651791"
Petroleum_Industrial
: 
"8.94984436"
Petroleum_Public_sector
: 
"0.03857049"
Petroleum_Rail
: 
"5.213712215"
Petroleum_Road_transport
: 
"156.024765"
Petroleum_Total
: 
"186.5218888"
Region
: 
"West Midlands"
Year
: 
"2010"
*/

export interface IEnergyDataItem extends IDataItem {
  Code: string;
  Year: string;
  All_fuels_Total: string;
  All_fuels_Domestic: string;
  Electricity_Domestic: string;
  Gas_Domestic: string;
  Petroleum_Total: string;
  Coal_Total: string;
}
export type IEnergyData = IEnergyDataItem[];

const excludedCode = [
  "K02000001",
  "DUKES",
  "K03000001",
  "K04000001",
  "E92000001",
  "E12000001",
  "E12000002",
  "E12000003",
  "E12000004",
  "E12000005",
  "E12000006",
  "E12000007",
  "E13000001",
  "E13000002",
  "E12000008",
  "E12000009",
  "W92000004",
  "S92000003",
  "N92000002",
  "Unallocated UK",
  "Unallocated GB",
  "Unallocated England and Wales",
  "Unallocated Scotland",
  "Unallocated Northern Ireland",
];

function massagedData<T extends IEnergyDataItem>(
  data: T[],
  key: keyof T
): Map<T[keyof T], T[]> | void {
  const dataByDistrict = new Map<T[keyof T], T[]>();
  data.forEach((item) => {
    if (dataByDistrict.has(item[key])) {
      const prevValue = dataByDistrict.get(item[key])!;
      dataByDistrict.set(item[key], [...prevValue, item]);
    } else {
      dataByDistrict.set(item[key], [item]);
    }
  });
  for (let [key, value] of dataByDistrict.entries()) {
    dataByDistrict.set(
      key,
      sort(value, (a, b) => ascending(parseInt(a.Year), parseInt(b.Year)))
    );
  }
  return dataByDistrict;
}

const useEnergyDataBy = (
  key: keyof IEnergyDataItem = "Code",
  type: keyof IEnergyDataItem
) => {
  const data = useData("../energy_consumption.csv") as IEnergyData;
  if (!data) return;
  const filteredData = data.filter((item) => !excludedCode.includes(item.Code));
  const returnData = massagedData<IEnergyDataItem>(filteredData, key);
  const dataExtent = extent(filteredData, (item: IEnergyDataItem) =>
    parseInt(item[type])
  ) as [number, number];
  const yearExtent = extent(filteredData, (item: IEnergyDataItem) =>
    parseInt(item.Year)
  ) as [number, number];

  return {
    data: returnData,
    yearRange: yearExtent,
    dataRange: dataExtent,
  };
};

export default useEnergyDataBy;
