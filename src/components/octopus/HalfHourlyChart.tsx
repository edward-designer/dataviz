import {
  interpolateRgbBasis,
  scaleBand,
  scaleLinear,
  scaleSequential,
} from "d3";
import { formatLocaleTimePeriod } from "../../utils/helpers";
import FormattedPrice from "./FormattedPrice";
import { PointerEvent, WheelEvent, useEffect, useRef, useState } from "react";
import { TariffResult } from "@/data/source";

export interface IHalfHourlyChart {
  rates: TariffResult[];
  min: number;
  max: number;
  priceAverage: number;
}

const HalfHourlyChart = ({
  rates,
  min,
  max,
  priceAverage,
}: IHalfHourlyChart) => {
  const currentPeriodRef = useRef<null | HTMLLIElement>(null);
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);
  const listContainerRef = useRef<null | HTMLOListElement>(null);
  const timeLineContainerRef = useRef<null | HTMLDivElement>(null);
  const [scrollProperty, setScrollProperty] = useState({
    isScrolling: false,
    originY: 0,
  });

  useEffect(() => {
    if (!scrollContainerRef.current || !currentPeriodRef.current) return;
    scrollContainerRef.current.scroll({
      top: currentPeriodRef.current.offsetTop - 100,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (
      !listContainerRef.current ||
      !currentPeriodRef.current ||
      !timeLineContainerRef.current
    )
      return;
    const listHeight = listContainerRef.current?.scrollHeight ?? 0;

    const setTimelinePosition = () => {
      if (!timeLineContainerRef.current) return;
      const timeAtNight = new Date();
      timeAtNight.setHours(23, 59, 59, 999);
      const portionOfDay =
        1 -
        (timeAtNight.valueOf() - new Date().valueOf()) / (60 * 60 * 24 * 1000);
      const timeLineTop = portionOfDay * listHeight;
      timeLineContainerRef.current.setAttribute(
        "style",
        `top:${timeLineTop}px`
      );
    };
    setTimelinePosition();
    const timeId = window.setInterval(setTimelinePosition, 1000);
    return () => window.clearInterval(timeId);
  }, []);

  const width = 100;
  const xScale = scaleLinear()
    .domain([0, rates[max]?.value_inc_vat ?? 0])
    .range([50, width]);
  const colorScale = scaleSequential(
    interpolateRgbBasis(["#aaffdd", "#3377bb", "#aa33cc"])
  ).domain([rates[min]?.value_inc_vat ?? 0, rates[max]?.value_inc_vat ?? 0]);
  const reversedRates = [...rates].reverse();
  const priceNowIndex = reversedRates.findIndex((data) => {
    const now = new Date();
    return new Date(data.valid_from) < now && new Date(data.valid_to) > now;
  });

  return (
    <div
      className="relative flex-1 flex overflow-y-scroll"
      ref={scrollContainerRef}
    >
      <div
        className="border-t border-accentPink-700 w-full absolute top-0 left-0 z-50"
        ref={timeLineContainerRef}
      >
        <div className="relative -top-2 h-0 w-0 border-t-8 border-l-8 border-b-8 border-solid border-t-transparent border-b-transparent border-l-accentPink-700" />
      </div>
      <ol
        ref={listContainerRef}
        className="flex-1 font-digit max-h-[100%] flex flex-col"
        onMouseDown={(event: PointerEvent<HTMLOListElement>) => {
          setScrollProperty({
            isScrolling: true,
            originY: event.clientY,
          });
        }}
        onMouseMove={(event: PointerEvent<HTMLOListElement>) => {
          if (!listContainerRef.current) return;
          if (!scrollProperty.isScrolling) return;
          listContainerRef.current.scroll({
            top:
              listContainerRef.current.scrollTop +
              (scrollProperty.originY - event.clientY > 0 ? 200 : -200),
            behavior: "smooth",
          });
          setScrollProperty({
            isScrolling: true,
            originY: event.clientY,
          });
        }}
        onMouseUp={(event: PointerEvent<HTMLOListElement>) => {
          setScrollProperty({
            isScrolling: false,
            originY: event.clientY,
          });
        }}
        onMouseLeave={(event: PointerEvent<HTMLOListElement>) => {
          setScrollProperty({
            isScrolling: false,
            originY: event.clientY,
          });
        }}
      >
        {reversedRates.length > 0 &&
          [...rates].reverse().map((rate, ind) => (
            <li
              key={ind}
              className={`flex items-center select-none ${
                ind === priceNowIndex
                  ? "shadow-[0_-1px_7px_rgba(20,0,30,0.5),_0_1px_7px_rgba(20,0,30,0.7)] z-40"
                  : ""
              }`}
              style={{}}
              ref={ind === priceNowIndex ? currentPeriodRef : null}
            >
              <span
                className="text-xs font-light text-theme-950 p-2 overflow-visible"
                style={{
                  width: `${xScale(rate.value_inc_vat)}%`,
                  background: colorScale(rate.value_inc_vat),
                }}
              >
                <span className="flex sm:items-center flex-col sm:flex-row overflow-visible ">
                  <span
                    className={`whitespace-nowrap sm:whitespace-normal block leading-tight min-w-18 sm:w-12 shrink-0`}
                  >
                    {formatLocaleTimePeriod(rate.valid_from, rate.valid_to)}
                  </span>
                  <span
                    className={`block leading-tight w-18 text-3xl md:text-4xl`}
                  >
                    <FormattedPrice price={rate.value_inc_vat} />
                  </span>
                </span>
              </span>
            </li>
          ))}
      </ol>
    </div>
  );
};
export default HalfHourlyChart;
