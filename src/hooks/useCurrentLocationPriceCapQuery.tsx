import { gsp } from "@/data/source";
import usePriceCapQuery from "./usePriceCapQuery";

const useCurrentLocationPriceCapQuery = ({ gsp }: { gsp: gsp }) => {
  const caps = usePriceCapQuery({ gsp });
  const getCapsRegionData = (gsp: gsp) =>
    caps.data
      ?.filter((row) => row.Region === gsp)
      .sort(
        (a, b) => new Date(b.Date).valueOf() - new Date(a.Date).valueOf()
      ) ?? [];
  const getCapsCurrentRegionData = (gsp: gsp) =>
    getCapsRegionData(gsp).find((d) => new Date(d.Date) <= new Date())!;

  return getCapsCurrentRegionData(gsp);
};

export default useCurrentLocationPriceCapQuery;
