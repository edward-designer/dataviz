import {
  interpolateRgbBasis,
  maxIndex,
  minIndex,
  scaleLinear,
  scaleSequential,
} from "d3";

import { useContext, useRef } from "react";

import EarningMonthlyChartBar from "./EarningMonthlyChartBar";
import { UserContext } from "@/context/user";

export interface IEarningMonthlyChart {
  cost: { [x: string]: number }[];
  lastDate: null | string;
  type: "E" | "G";
  units: { [x: string]: number }[] | null;
}

const EarningMonthlyChart = ({
  cost,
  lastDate,
  type,
  units,
}: IEarningMonthlyChart) => {
  const { value } = useContext(UserContext);
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const valueAccessor = (d: { [x: string]: number } | null) =>
    d && Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const min = minIndex(cost, (d) => valueAccessor(d) ?? 0);
  const max = maxIndex(cost, (d) => valueAccessor(d) ?? 0);

  const width = 100;
  const xScale = scaleLinear()
    .domain([0, valueAccessor(cost[max]) ?? 0])
    .range([10, width]);
  const colorScale = scaleSequential(
    interpolateRgbBasis(["#e1eb96", "#f5b567"])
  ).domain([valueAccessor(cost[min]) ?? 0, valueAccessor(cost[max]) ?? 0]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex-1 flex" ref={scrollContainerRef}>
        <ol className="flex-1 font-digit max-h-[100%] flex flex-col">
          {cost.length >= 1 ? (
            cost.map((monthlyCost, ind) => {
              const monthlycostCurrent = valueAccessor(monthlyCost) ?? 0;
              const chartBarProps = {
                monthlycostCurrent,
                widthCurrent: xScale(monthlycostCurrent),
                color: colorScale(monthlycostCurrent),
                period: periodAccessor(monthlyCost),
                ind,
                lastDate,
                reading: valueAccessor(units && units[ind]),
              };
              return (
                <EarningMonthlyChartBar
                  key={value.EESerialNo}
                  {...chartBarProps}
                />
              );
            })
          ) : (
            <div>Sorry temporarily unavailable. Please check back later.</div>
          )}
        </ol>
      </div>
    </div>
  );
};
export default EarningMonthlyChart;
