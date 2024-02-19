import {
  interpolateRgbBasis,
  maxIndex,
  minIndex,
  scaleLinear,
  scaleSequential,
} from "d3";

import { useContext, useRef } from "react";

import MonthlyChartBar from "./MonthlyChartBar";
import { UserContext } from "@/context/user";
import { HiVizContext } from "@/context/hiViz";

export interface IMonthlyChart {
  cost: { [x: string]: number }[];
  costSVT: { [x: string]: number }[];
  lastDate: null | string;
  type: "E" | "G";
  compare: string;
  tariff: string;
}

const MonthlyChart = ({
  cost,
  costSVT,
  lastDate,
  type,
  compare,
  tariff,
}: IMonthlyChart) => {
  const { value } = useContext(UserContext);
  const { hiViz } = useContext(HiVizContext);

  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const min = minIndex(cost, (d) => valueAccessor(d) ?? 0);
  const max = maxIndex(cost, (d) => valueAccessor(d) ?? 0);

  const minSVT = minIndex(costSVT, (d) => valueAccessor(d) ?? 0);
  const maxSVT = maxIndex(costSVT, (d) => valueAccessor(d) ?? 0);

  const width = 100;
  const xScale = scaleLinear()
    .domain([
      0,
      Math.max(
        valueAccessor(cost[max]) ?? 0,
        valueAccessor(costSVT[maxSVT]) ?? 0
      ),
    ])
    .range([10, width]);
  const colorScale = scaleSequential(
    interpolateRgbBasis(hiViz ? ["#ccfcde", "#92cdfc"] : ["#aafbc7", "#64c2f1"])
  ).domain([valueAccessor(cost[min]) ?? 0, valueAccessor(cost[max]) ?? 0]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex-1 flex" ref={scrollContainerRef}>
        <ol className="flex-1 font-digit max-h-[100%] flex flex-col">
          {cost.length >= 1 ? (
            cost.map((monthlyCost, ind) => {
              const monthlycostSVT = valueAccessor(costSVT[ind]);
              const monthlycostCurrent = valueAccessor(monthlyCost);
              const saving = monthlycostSVT - monthlycostCurrent;
              const chartBarProps = {
                saving,
                monthlycostCurrent,
                monthlycostSVT,
                widthSVT: xScale(monthlycostSVT),
                widthCurrent: xScale(monthlycostCurrent),
                color: colorScale(monthlycostCurrent),
                period: periodAccessor(monthlyCost),
                ind,
                lastDate,
              };
              return (
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
          <span className="inline-block w-8 h-2 bg-[#aaffdd]"></span>{" "}
          {compare === "Tracker"
            ? "New Tracker"
            : compare === "Current"
            ? "Current Tariff"
            : tariff}
        </span>
        <span className="inline-block">
          <span className="inline-block w-8 border-t border-dashed border-accentPink-500 -translate-y-1"></span>{" "}
          {compare === "Tracker"
            ? "Old Tracker"
            : "Standard Variable Tariff (SVT)"}
        </span>
      </div>
    </div>
  );
};
export default MonthlyChart;
