import { TariffResult } from "@/data/source";
import { interpolateRgbBasis, scaleLinear, scaleSequential } from "d3";
import { PointerEvent, useEffect, useRef, useState } from "react";
import { formatLocaleTimePeriod } from "../../utils/helpers";
import FormattedPrice from "./FormattedPrice";

export interface IHalfHourlyChart {
  rates: TariffResult[];
  min: number;
  max: number;
  priceAverage: number;
  showTicker?: boolean;
}

const HalfHourlyChart = ({
  rates,
  min,
  max,
  priceAverage,
  showTicker = true,
}: IHalfHourlyChart) => {
  const currentPeriodRef = useRef<null | HTMLLIElement>(null);
  const scrollContainerRef = useRef<null | HTMLDivElement>(null);
  const listContainerRef = useRef<null | HTMLOListElement>(null);
  const currentPeriodIndicatorRef = useRef<null | HTMLDivElement>(null);
  const timeLineContainerRef = useRef<null | HTMLDivElement>(null);
  const [scrollProperty, setScrollProperty] = useState({
    isScrolling: false,
    originY: 0,
  });

  useEffect(() => {
    if (!scrollContainerRef.current || !currentPeriodRef.current || !showTicker)
      return;
    scrollContainerRef.current.scroll({
      top: currentPeriodRef.current.offsetTop - 100,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (
      !showTicker ||
      !listContainerRef.current ||
      !currentPeriodRef.current ||
      !timeLineContainerRef.current ||
      !currentPeriodIndicatorRef.current ||
      reversedRates.length === 0 ||
      reversedRates.length % 2 !== 0
    )
      return;
    const listHeight = listContainerRef.current?.scrollHeight ?? 0;
    const setTimelinePosition = () => {
      if (!timeLineContainerRef.current) return;
      const endTimeLastPeriod = new Date();
      const lastHourOnList = new Date(
        reversedRates.at(-1)?.valid_from ?? ""
      ).getHours();
      endTimeLastPeriod.setHours(lastHourOnList, 59, 59, 999);
      const portionOfDay =
        1 -
        (endTimeLastPeriod.valueOf() - new Date().valueOf()) /
          (((60 * 60 * reversedRates.length) / 2) * 1000);
      const timeLineTop = portionOfDay * listHeight;
      timeLineContainerRef.current.setAttribute(
        "style",
        `top:${timeLineTop}px`
      );
    };
    const setCurrentPeriodIndicatorPosition = () => {
      if (!currentPeriodIndicatorRef.current || !currentPeriodRef.current)
        return;

      const listHeight =
        currentPeriodRef.current.getBoundingClientRect().height;
      const currentIndex = reversedRates.findIndex((data) => {
        const now = new Date();
        return new Date(data.valid_from) < now && new Date(data.valid_to) > now;
      });

      currentPeriodIndicatorRef.current.setAttribute(
        "style",
        `top:${currentIndex * listHeight}px;height:${listHeight}px`
      );
      setTimelinePosition();
    };
    setCurrentPeriodIndicatorPosition();
    const timeId = window.setInterval(setCurrentPeriodIndicatorPosition, 1000);
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
      {showTicker && (
        <>
          <div
            className="border-t border-accentPink-700 w-full absolute top-0 left-0 z-50"
            ref={timeLineContainerRef}
          >
            <div className="relative -top-2 h-0 w-0 border-t-8 border-l-8 border-b-8 border-solid border-t-transparent border-b-transparent border-l-accentPink-700" />
          </div>
          <div
            ref={currentPeriodIndicatorRef}
            className="absolute w-full h-[56px] border-2 border-accentBlue-200 top-0 left-0"
          ></div>
        </>
      )}
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
              className={`flex items-center select-none`}
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
