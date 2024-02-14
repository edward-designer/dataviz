import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiOutlineCurrencyPound } from "react-icons/hi2";
import FormattedPrice from "./FormattedPrice";
import { evenRound } from "@/utils/helpers";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { CSSProperties, useState } from "react";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbPigMoney } from "react-icons/tb";
import { TbMoneybag } from "react-icons/tb";
import { GrMoney } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";

interface IMonthlyChartBar {
  widthSVT: number;
  widthCurrent: number;
  color: CSSProperties["color"];
  period: string;
  saving: number;
  monthlycostCurrent: number;
  monthlycostSVT: number;
  ind: number;
  lastDate: null | string;
}

const MonthlyChartBar = ({
  widthSVT,
  widthCurrent,
  color,
  period,
  saving,
  monthlycostCurrent,
  monthlycostSVT,
  ind,
  lastDate,
}: IMonthlyChartBar) => {
  const [open, setOpen] = useState(false);
  const isCheaper = monthlycostSVT - monthlycostCurrent > 0;

  return (
    <li className={`relative flex items-center select-none`}>
      <span
        className={`z-20 w-0 animate-chart-grow absolute left-0 border-r-2 border-dashed border-accentPink-500 h-full bg-accentPink-950/30n pointer-events-none`}
        style={
          {
            "--chart-grow-width": `${widthSVT}%`,
            animationDelay: `${500 + ind * 100}ms`,
          } as React.CSSProperties
        }
      ></span>

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
                </span>
                <span
                  className={`flex leading-tight w-18 font-bold text-xl md:font-extralight md:text-4xl items-center`}
                >
                  {saving > 0 ? (
                    <TbPigMoney
                      className={`md:text-white ${
                        widthCurrent < 40
                          ? "mix-blend-normal text-white"
                          : "text-black"
                      } w-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
                    />
                  ) : (
                    <IoMdTrendingUp
                      className={`md:text-accentPink-500 w-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
                    />
                  )}
                  <span
                    className={`${
                      widthCurrent < 40 ? "mix-blend-difference text-white" : ""
                    } `}
                  >
                    <FormattedPrice price={Math.abs(saving)} value="pound" />
                  </span>
                </span>
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-theme-900 text-base font-sans">
            {ind === 0 && lastDate && (
              <div className={`text-xs font-sans text-theme-300 mb-1`}>
                (latest reading: {new Date(lastDate).toLocaleString("en-GB")})
              </div>
            )}
            <div
              className={`flex items-center gap-1 ${
                isCheaper ? "text-theme-300" : "text-accentPink-500"
              } `}
            >
              <TbMoneybag />
              {isCheaper ? "Current" : "New"} : £
              {evenRound(monthlycostCurrent, 2, true)}
            </div>
            <div
              className={`flex items-center gap-1 ${
                isCheaper ? "text-accentPink-500" : "text-theme-300"
              } `}
            >
              <TbMoneybag />
              {isCheaper ? "SVT" : "Old"} : £
              {evenRound(monthlycostSVT, 2, true)}
            </div>
            <div className="flex items-center gap-1 text-[#85cbf9] border-theme-700 border-t mt-1 pt-1 font-bold">
              <TbPigMoney />
              {isCheaper ? "Saving" : "Increase"}: £
              {evenRound(Math.abs(saving), 2)}{" "}
            </div>
            <TooltipArrow className="fill-theme-900" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
};

export default MonthlyChartBar;
