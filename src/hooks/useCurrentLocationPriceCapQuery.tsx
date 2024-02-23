import { gsp } from "@/data/source";
import usePriceCapQuery from "./usePriceCapQuery";

const useCurrentLocationPriceCapQuery = ({
  gsp,
  next = false,
}: {
  gsp: gsp;
  next?: boolean;
}) => {
  const caps = usePriceCapQuery({ gsp });
  const getCapsRegionData = (gsp: gsp) =>
    caps.data
      ?.filter((row) => row.Region === gsp)
      .sort(
        (a, b) => new Date(b.Date).valueOf() - new Date(a.Date).valueOf()
      ) ?? [];
  const getCapsCurrentRegionData = (gsp: gsp) =>
    getCapsRegionData(gsp).find((d) =>
      next ? new Date(d.Date) > new Date() : new Date(d.Date) <= new Date()
    )!;

  return getCapsCurrentRegionData(gsp);
};

export default useCurrentLocationPriceCapQuery;
