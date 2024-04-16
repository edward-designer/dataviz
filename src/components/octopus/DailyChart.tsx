import {
  interpolateRgbBasis,
  max,
  maxIndex,
  min,
  minIndex,
  scaleLinear,
  scaleSequential,
} from "d3";

import { useContext, useRef } from "react";

import MonthlyChartBar from "./MonthlyChartBar";
import { UserContext } from "@/context/user";
import EarningMonthlyChartBar from "./EarningMonthlyChartBar";

interface IDailyChartResult {
  reading: number;
  cost: number;
  SVTcost: number;
  standingCharge: number;
  SVTstandingCharge: number;
  tariff: string;
}

const DailyChart = ({
  data,
  type,
  month,
  dual,
}: {
  data: IDailyChartResult[];
  type: "E" | "G" | "EE";
  month: string;
  dual?: boolean;
}) => {
  const { value } = useContext(UserContext);
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const minTariff = min(data, (d) => (d.cost + d.standingCharge) / 100);
  const maxTariff = max(data, (d) => (d.cost + d.standingCharge) / 100);

  const minSVT = min(data, (d) => (d.SVTcost + d.SVTstandingCharge) / 100);
  const maxSVT = max(data, (d) => (d.SVTcost + d.SVTstandingCharge) / 100);

  const width = 100;
  const xScale = scaleLinear()
    .domain([
      0,
      type === "EE" ? maxTariff ?? 0 : Math.max(maxTariff ?? 0, maxSVT ?? 0),
    ])
    .range([10, width]);
  const colorScale = scaleSequential(
    interpolateRgbBasis(
      type === "EE" ? ["#e1eb96", "#f5b567"] : ["#aafbc7", "#64c2f1"]
    )
  ).domain([minTariff ?? 0, maxTariff ?? 0]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex-1 flex" ref={scrollContainerRef}>
        <ol className="flex-1 font-digit max-h-[100%] flex flex-col">
          {data.length >= 1 ? (
            data.map((dailyResult, ind) => {
              const SVTnet =
                (dailyResult.SVTcost + dailyResult.SVTstandingCharge) / 100;
              const currentNet =
                (dailyResult.cost + dailyResult.standingCharge) / 100;
              const chartBarProps = {
                saving: SVTnet - currentNet,
                monthlycostCurrent: currentNet,
                monthlycostSVT: SVTnet,
                widthSVT: xScale(SVTnet),
                widthCurrent: xScale(currentNet),
                color: colorScale(currentNet),
                period: `${ind + 1} ${month}`,
                ind,
                tariff: dailyResult.tariff,
                reading: dailyResult.reading,
                dual,
                standingCharge: dailyResult.standingCharge,
              };
              return type === "EE" ? (
                <EarningMonthlyChartBar
                  key={`${value.EESerialNo}-${ind}`}
                  {...chartBarProps}
                />
              ) : (
                <MonthlyChartBar
                  key={`${
                    type === "E" ? value.ESerialNo : value.GSerialNo
                  }-${ind}`}
                  {...chartBarProps}
                />
              );
            })
          ) : (
            <div>Sorry temporarily unavailable. Please check back later.</div>
          )}
        </ol>
      </div>
      <div className="text-xs mt-4 flex flex-wrap gap-x-4">
        <span className="inline-block">
          <span className="inline-block w-8 border-t border-dashed border-accentPink-500 -translate-y-1"></span>{" "}
          Standard Variable Tariff (SVT)
        </span>
      </div>
    </div>
  );
};
export default DailyChart;
