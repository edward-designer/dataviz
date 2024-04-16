import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HiOutlineCurrencyPound } from "react-icons/hi2";
import FormattedPrice from "./FormattedPrice";
import { evenRound, getCategory } from "@/utils/helpers";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { CSSProperties, useContext, useState } from "react";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbPigMoney } from "react-icons/tb";
import { TbMoneybag } from "react-icons/tb";
import { GrMoney } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { BsSpeedometer2 } from "react-icons/bs";
import { TiEquals } from "react-icons/ti";
import { HiVizContext } from "@/context/hiViz";

interface IMonthlyChartBar {
  widthSVT: number;
  widthCurrent: number;
  color: CSSProperties["color"];
  period: string;
  saving: number;
  monthlycostCurrent: number;
  monthlycostSVT: number;
  ind: number;
  lastDate?: null | string;
  tariff?: string | undefined;
  reading?: number | undefined;
  dual?: boolean;
  standingCharge?: number | undefined;
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
  lastDate = null,
  tariff = undefined,
  reading = undefined,
  dual = false,
  standingCharge = undefined,
}: IMonthlyChartBar) => {
  const { hiViz } = useContext(HiVizContext);

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
                  className={`text-xs md:text-base font-extrabold whitespace-nowrap sm:whitespace-normal flex items-center leading-tight min-w-20 sm:w-14 shrink-0 md:mix-blend-normal md:text-black `}
                >
                  {period}
                  {tariff && (
                    <span className="font-sans font-normal rounded-lg text-black bg-accentBlue-200/70 ml-1 -mt-[3px] px-1 py-[1px] leading-tight text-[8px]  sm:hidden whitespace-nowrap">
                      {tariff}
                    </span>
                  )}
                </span>
                <span
                  className={`flex leading-tight w-18 font-bold text-xl md:font-extralight md:text-4xl items-center`}
                >
                  {getCategory(tariff ?? "") === "SVT" && !dual ? (
                    <TiEquals
                      className={`${
                        hiViz ? "text-theme-950" : "text-white"
                      } mix-blend-normal  w-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
                    />
                  ) : saving >= 0 ? (
                    <TbPigMoney
                      className={`${
                        hiViz ? "text-theme-950" : "text-white"
                      } mix-blend-normal tw-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
                    />
                  ) : (
                    <IoMdTrendingUp
                      className={`${
                        hiViz
                          ? "text-theme-950"
                          : "text-white md:text-accentPink-500"
                      } w-4 h-4 md:w-6 md:h-6 flex-shrink-0`}
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
                {tariff && (
                  <span
                    className={`${
                      hiViz
                        ? "bg-black border border-slate-700"
                        : "bg-accentBlue-900"
                    } font-sans font-normal rounded-full ml-2 px-2 py-[2px] leading-tight text-[8px] hidden sm:inline-block text-white whitespace-nowrap`}
                  >
                    {tariff}
                  </span>
                )}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent
            className={`${
              hiViz ? "bg-black" : "bg-theme-900"
            } text-base font-sans`}
          >
            {ind === 0 && lastDate && (
              <div className={`text-xs font-sans text-theme-300 mb-1`}>
                (latest reading: {new Date(lastDate).toLocaleString("en-GB")})
              </div>
            )}
            {reading !== undefined && reading >= 0 && (
              <div className="flex items-center gap-1 text-[#85cbf9] border-theme-700 border-b mb-1 pb-1">
                <BsSpeedometer2 />
                Meter : {evenRound(Math.abs(reading), 2)}kWh
              </div>
            )}
            <div
              className={`flex items-center gap-1 ${
                isCheaper ? "text-theme-300" : "text-accentPink-500"
              } `}
            >
              <TbMoneybag />
              Actual : £{evenRound(monthlycostCurrent, 2, true)}
            </div>
            <div
              className={`flex items-center gap-1 ${
                isCheaper ? "text-accentPink-500" : "text-theme-300"
              } `}
            >
              <TbMoneybag />
              SVT : £{evenRound(monthlycostSVT, 2, true)}
            </div>
            <div className="flex items-center gap-1 text-[#85cbf9] border-theme-700 border-t mt-1 pt-1 font-bold">
              <TbPigMoney />
              {isCheaper ? "Saving" : "Increase"}: £
              {evenRound(Math.abs(saving), 2)}{" "}
            </div>
            {reading !== undefined &&
              standingCharge !== undefined &&
              reading > 0 && (
                <div className="flex items-center gap-1 text-theme-300">
                  <BsSpeedometer2 />
                  Unit Rate:{" "}
                  {evenRound(
                    ((monthlycostCurrent - standingCharge / 100) / reading) *
                      100,
                    2,
                    true
                  )}
                  p
                </div>
              )}
            <TooltipArrow className="fill-theme-900" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </li>
  );
};

export default MonthlyChartBar;
