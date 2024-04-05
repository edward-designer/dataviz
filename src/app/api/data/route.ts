import { ENERGY_TYPE } from "@/data/source";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupBy = searchParams.get("groupBy");
  const category = searchParams.get("category");
  const type = searchParams.get("type") as "E" | "G";
  const fromISODate = searchParams.get("fromISODate");
  const toISODate = searchParams.get("toISODate");
  let deviceNumber = "2000053608085";
  let serialNo = "18L2112787";
  if (type === "G") {
    deviceNumber = "7526867908";
    serialNo = "E6S10897551961";
  }
  const groupByPara = groupBy === "halfhour" ? "" : `&group_by=${groupBy}`;
  const url =
    category === "Chart"
      ? `https://api.octopus.energy/v1/${ENERGY_TYPE[type]}-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate}&period_to=${toISODate}&page_size=25000${groupByPara}`
      : `https://api.octopus.energy/v1/${ENERGY_TYPE[type]}-meter-points/${deviceNumber}/meters/${serialNo}/consumption/?period_from=${fromISODate}&period_to=${toISODate}&page_size=25000${groupByPara}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(process.env.DATA_API_KEY!)}`,
    },
    next: { revalidate: 86400 },
  });
  const product = await res.json();

  return Response.json({ results: product.results });
}
