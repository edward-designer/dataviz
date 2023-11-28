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
  const listContainerRef = useRef<null | HTMLOListElement>(null);
  const [scrollProperty, setScrollProperty] = useState({
    isScrolling: false,
    originY: 0,
  });

  useEffect(() => {
    if (!listContainerRef.current || !currentPeriodRef.current) return;
    listContainerRef.current.scroll({
      top: currentPeriodRef.current.offsetTop - 100,
      left: 0,
      behavior: "smooth",
    });
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
    <ol
      ref={listContainerRef}
      className="flex-1 font-digit max-h-[100%] overflow-y-scroll flex flex-col"
      onPointerDown={(event: PointerEvent<HTMLOListElement>) => {
        setScrollProperty({
          isScrolling: true,
          originY: event.clientY,
        });
      }}
      onPointerMove={(event: PointerEvent<HTMLOListElement>) => {
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
      onPointerUp={(event: PointerEvent<HTMLOListElement>) => {
        setScrollProperty({
          isScrolling: false,
          originY: event.clientY,
        });
      }}
      onPointerLeave={(event: PointerEvent<HTMLOListElement>) => {
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
                ? "shadow-[0_-1px_7px_rgba(20,0,30,0.5),_0_1px_7px_rgba(20,0,30,0.7)] z-50"
                : ""
            }`}
            style={{}}
            ref={ind === priceNowIndex ? currentPeriodRef : null}
          >
            <span
              className="text-xs font-bold text-theme-950 flex items-center p-2 overflow-visible"
              style={{
                width: `${xScale(rate.value_inc_vat)}%`,
                background: colorScale(rate.value_inc_vat),
              }}
            >
              <span
                className={`block w-12  ${
                  ind === priceNowIndex ? " text-accentBlue-950" : ""
                }`}
              >
                {formatLocaleTimePeriod(rate.valid_from, rate.valid_to)}
              </span>
              <span
                className={`block w-18  ${
                  ind === priceNowIndex
                    ? "text-4xl text-accentBlue-950"
                    : "text-3xl"
                }`}
              >
                <FormattedPrice price={rate.value_inc_vat} />
              </span>
            </span>
          </li>
        ))}
    </ol>
  );
};
export default HalfHourlyChart;
