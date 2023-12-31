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
  } = inputs;
  const groupBy = {
    Agile: "",
    Go: "",
    Cosy: "",
    Tracker: "&group_by=day",
    SVT: "&group_by=day",
    Fixed: "&group_by=day",
    Chart: "&group_by=day",
  };

  const queryFn = async () => {
    const url =
      category === "Chart"
        ? `https://api.octopus.energy/v1/${ENERGY_TYPE[type]}-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate}&period_to=${toISODate}&page_size=25000${groupBy[category]}`
        : `https://api.octopus.energy/v1/${ENERGY_TYPE[type]}-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate}&page_size=25000${groupBy[category]}`;
    try {
      // page_size 25000 is a year's data
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(apiKey)}`,
        },
      });
      if (!response.ok) throw new Error("Sorry the request was unsuccessful");
      return response.json();
    } catch (err: unknown) {
      if (err instanceof Error)
        throw new Error(`Sorry, we have an error: ${err.message}`);
      throw new Error("Sorry, the request was unsuccessful");
    }
  };

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [deviceNumber, serialNo, category, fromISODate, toISODate],
    queryFn,
    enabled: !!deviceNumber && !!serialNo && !!category,
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
