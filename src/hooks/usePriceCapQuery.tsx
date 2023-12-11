import { CapsTSVResult, TariffType, gsp } from "@/data/source";
import { useQuery } from "@tanstack/react-query";
import { tsv } from "d3";

const usePriceCapQuery = ({ gsp = "UK" }: { gsp?: gsp | "UK" }) => {
  const queryCapFn = (url: string) => async () => {
    const capsTsv = await tsv(url, (d) => d as CapsTSVResult);
    return capsTsv;
  };

  const caps = useQuery({
    queryKey: ["getCaps", gsp],
    queryFn: queryCapFn(
      "https://gist.githubusercontent.com/edward-designer/232d54ace5006183d873e9eebcf82da2/raw/energy_price_caps.tsv"
    ),
  });

  return caps;
};

export default usePriceCapQuery;
