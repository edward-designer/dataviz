import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { evenRound } from "@/utils/helpers";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { CSSProperties, useState } from "react";
import FormattedPrice from "./FormattedPrice";

import { RiMoneyPoundCircleLine } from "react-icons/ri";
import { TbSunElectricity } from "react-icons/tb";

interface IEarningMonthlyChartBar {
  widthCurrent: number;
  color: CSSProperties["color"];
  period: string;
  monthlycostCurrent: number;
  ind: number;
  lastDate?: null | string;
  tariff?: string | undefined;
  reading?: null | number;
}

const EarningMonthlyChartBar = ({
  widthCurrent,
  color,
  period,
  monthlycostCurrent,
  ind,
  lastDate,
  tariff,
  reading,
}: IEarningMonthlyChartBar) => {
  const [open, setOpen] = useState(false);

  return (
    <li className={`relative flex items-center select-none`}>
      <TooltipProvider delayDuration={0}>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger
            asChild
            onClick={() => setOpen((prevOpen) => !prevOpen)}
            onFocus={() => setTimeout(() => setOpen(true), 0)}
            onBlur={() => setOpen(false)}
          >
            <span
              className={`animate-chart-grow w-0 relative text-base font-normal text-theme-950 p-2 overflow-visible hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6),0_-4px_6px_-4px_rgb(0,0,0,0.3)] hover:z-10`}
              style={
                {
                  "--chart-grow-width": `${widthCurrent}%`,
                  background: color,
                  animationDelay: `${ind * 100}ms`,
                } as React.CSSProperties
              }
            >
              <span className="flex sm:items-center flex-col sm:flex-row overflow-visible ">
                <span
                  className={`text-xs md:text-base font-bold whitespace-nowrap sm:whitespace-normal block leading-tight min-w-20 sm:w-14 shrink-0  md:mix-blend-normal md:text-black ${
                    widthCurrent < 40 ? "mix-blend-difference text-white" : ""
                  }`}
                >
                  {period}
                  {tariff && (
                    <span className="rounded-full inline-block ml-2 bg-accentBlue-900 px-2 text-[8px] sm:hidden text-white whitespace-nowrap">
                      {tariff}
                    </span>
                  )}
                </span>
                <span
                  className={`flex leading-tight w-18 font-bold text-xl md:font-extralight md:text-4xl items-center`}
                >
                  <RiMoneyPoundCircleLine
                    className={`md:text-white ${
                      widthCurrent < 40
                        ? "mix-blend-normal text-white"
                        : "text-black"
                    } w-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
                  />

                  <span
                    className={`${
                      widthCurrent < 40 ? "mix-blend-difference text-white" : ""
                    } `}
                  >
                    <FormattedPrice price={monthlycostCurrent} value="pound" />
                  </span>
                </span>
                {tariff && (
                  <span className="rounded-full ml-2 bg-accentBlue-900 px-2 py-[2px] leading-tight text-[8px] hidden sm:inline-block text-white whitespace-nowrap">
                    {tariff}
                  </span>
                )}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-theme-900 text-base font-sans">
            {ind === 0 && lastDate && (
              <div className={`text-xs font-sans text-theme-300 mb-1`}>
                (latest reading: {new Date(lastDate).toLocaleString("en-GB")})
              </div>
            )}
            {reading && (
              <div
                className={`flex items-center gap-1 text-theme-300
               `}
              >
                <TbSunElectricity />
                Export : {evenRound(reading, 2, true)} kWh
              </div>
            )}
            <div
              className={`flex items-center gap-1 text-theme-300
               `}
            >
              <RiMoneyPoundCircleLine />
              Earning : £{evenRound(monthlycostCurrent, 2, true)}
            </div>

            <TooltipArrow className="fill-theme-900" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
};

export default EarningMonthlyChartBar;
