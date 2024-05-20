import {
  ENERGY_TYPE,
  IConsumptionData,
  TariffCategory,
  TariffType,
} from "@/data/source";
import { fillMissingDays } from "@/utils/helpers";
import { useQuery } from "@tanstack/react-query";

export type IUseConsumptionData = {
  deviceNumber: string;
  serialNo: string;
  fromISODate: string;
  toISODate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  apiKey: string;
  dual?: boolean;
  testRun?: boolean;
};

const useConsumptionData = (inputs: IUseConsumptionData) => {
  const {
    fromISODate,
    toISODate,
    type,
    category,
    deviceNumber,
    serialNo,
    apiKey,
    dual = false,
    testRun = false,
  } = inputs;
  const groupBy = {
    Agile: "",
    Go: "",
    IGo: "",
    Cosy: "",
    Flux: "",
    IFlux: "",
    Tracker: "&group_by=day",
    SVT: dual ? "" : "&group_by=day",
    E7: "",
    Fixed: "&group_by=day",
    Chart: "&group_by=day",
  };
  const groupByType =
    ["Agile", "Go", "IGo", "Cosy", "Flux", "IFlux"].includes(category) || dual
      ? "halfhour"
      : "day";

  // octopus api only accept date string in ISO format with the milliseconds format (i.e. without .000)
  const queryFn = async () => {
    const url =
      category === "Chart"
        ? `https://api.octopus.energy/v1/${
            ENERGY_TYPE[type]
          }-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate.replace(
            ".000",
            ""
          )}&period_to=${toISODate.replace(".000", "")}&page_size=25000${
            groupBy[category]
          }`
        : `https://api.octopus.energy/v1/${
            ENERGY_TYPE[type]
          }-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate.replace(
            ".000",
            ""
          )}&period_to=${toISODate.replace(".000", "")}&page_size=25000${
            groupBy[category]
          }`;

    try {
      // page_size 25000 is a year's data
      if (testRun) {
        const response = await fetch(
          `/api/data?fromISODate=${fromISODate.replace(
            ".000",
            ""
          )}&toISODate=${toISODate.replace(
            ".000",
            ""
          )}&category=${category}&type=${type}&groupBy=${groupByType}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Sorry the request was unsuccessful");
        return response.json();
      } else {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(apiKey)}`,
          },
        });
        if (!response.ok) throw new Error("Sorry the request was unsuccessful");
        return response.json();
      }
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [deviceNumber, serialNo, groupByType, fromISODate, toISODate],
    queryFn,
    enabled:
      (!!deviceNumber &&
        !!serialNo &&
        !!category &&
        !!deviceNumber &&
        !!serialNo) ||
      testRun,
    retry: !!deviceNumber && !!serialNo ? 0 : 5,
  });

  return {
    data:
      category === "Chart"
        ? { ...data, results: fillMissingDays(data?.results) }
        : data,
    isSuccess,
    isLoading,
  };
};

export default useConsumptionData;
