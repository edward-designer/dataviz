import { TariffResult } from "@/data/source";
import {
  interpolateRgbBasis,
  maxIndex,
  minIndex,
  scaleLinear,
  scaleSequential,
} from "d3";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PointerEvent, useContext, useEffect, useRef, useState } from "react";
import { evenRound, formatLocaleTimePeriod } from "../../utils/helpers";
import FormattedPrice from "./FormattedPrice";
import { WindowVisibilityContext } from "@/context/windowVisibility";

import { TbPigMoney } from "react-icons/tb";
import { HiOutlineCurrencyPound } from "react-icons/hi2";
import { TooltipArrow } from "@radix-ui/react-tooltip";

export interface IMonthlyChart {
  cost: { [x: string]: number }[];
  costSVT: { [x: string]: number }[];
  priceAverage: number;
}

const MonthlyChart = ({ cost, costSVT, priceAverage }: IMonthlyChart) => {
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const min = minIndex(cost, (d) => valueAccessor(d) ?? 0);
  const max = maxIndex(cost, (d) => valueAccessor(d) ?? 0);

  const minSVT = minIndex(costSVT, (d) => valueAccessor(d) ?? 0);
  const maxSVT = maxIndex(costSVT, (d) => valueAccessor(d) ?? 0);

  const width = 100;
  const xScale = scaleLinear()
    .domain([0, valueAccessor(costSVT[maxSVT]) ?? 0])
    .range([10, width]);
  const colorScale = scaleSequential(
    interpolateRgbBasis(["#aaffdd", "#3377FF"])
  ).domain([valueAccessor(cost[min]) ?? 0, valueAccessor(cost[max]) ?? 0]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex-1 flex" ref={scrollContainerRef}>
        <ol className="flex-1 font-digit max-h-[100%] flex flex-col">
          {cost.length > 0 &&
            cost.map((monthlyCost, ind) => {
              const monthlycostSVT = valueAccessor(costSVT[ind]);
              const monthlycostCurrent = valueAccessor(monthlyCost);
              const saving = monthlycostSVT - monthlycostCurrent;

              return (
                <li
                  key={ind}
                  className={`relative flex items-center select-none`}
                >
                  <span
                    className={`z-20 delay-500 animate-chart-grow absolute left-0 border-r border-dashed border-accentPink-500 h-full bg-accentPink-950/30n pointer-events-none`}
                    style={
                      {
                        "--chart-grow-width": `${xScale(monthlycostSVT)}%`,
                      } as React.CSSProperties
                    }
                  ></span>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="animate-chart-grow relative text-base font-light text-theme-950 p-2 overflow-visible hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6),0_-4px_6px_-4px_rgb(0,0,0,0.3)] hover:z-10"
                          style={
                            {
                              "--chart-grow-width": `${xScale(
                                monthlycostCurrent
                              )}%`,
                              background: colorScale(saving),
                            } as React.CSSProperties
                          }
                        >
                          <span className="flex sm:items-center flex-col sm:flex-row overflow-visible ">
                            <span
                              className={`whitespace-nowrap sm:whitespace-normal block leading-tight min-w-20 sm:w-14 shrink-0 text-white mix-blend-difference md:mix-blend-normal md:text-black`}
                            >
                              {periodAccessor(monthlyCost)}
                            </span>
                            <span
                              className={`flex leading-tight w-18 text-3xl md:text-4xl items-center text-white mix-blend-difference md:mix-blend-normal md:text-black`}
                            >
                              <HiOutlineCurrencyPound className="hidden lg:block w-6 h-6 stroke-accentBlue-500" />
                              <FormattedPrice price={saving} value="pound" />
                            </span>
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-theme-900">
                        <p>
                          Charge: £{monthlycostCurrent}
                          <br />
                          <span className="text-accentPink-500">
                            SVT: £{monthlycostSVT}
                          </span>
                          <br />
                          <strong className="text-accentBlue-500 border-theme-700 border-t mt-1 pt-1 inline-block font-bold">
                            Saves: £{evenRound(saving, 2)}{" "}
                          </strong>
                          <span className="text-[8px] text-accentBlue-500">
                            {" "}
                            (vs SVT)
                          </span>
                        </p>
                        <TooltipArrow className="fill-theme-900" />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              );
            })}
        </ol>
      </div>
      <div className="text-xs mt-4">
        <span className="inline-block w-8 border-t border-dashed border-accentPink-500 -translate-y-1"></span>{" "}
        Standard Variable Tariff (SVT)
      </div>
    </div>
  );
};
export default MonthlyChart;
