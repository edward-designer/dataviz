import {
  interpolateRgbBasis,
  scaleBand,
  scaleLinear,
  scaleSequential,
} from "d3";
import { formatLocaleTimePeriod } from "../../utils/helpers";
import FormattedPrice from "./FormattedPrice";
import { PointerEvent, useEffect, useRef, useState } from "react";
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
    if (!currentPeriodRef.current) return;
    currentPeriodRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const xScale = scaleLinear()
    .domain([0, rates[max]?.value_inc_vat ?? 0])
    .range([0, 350]);
  const yScale = scaleBand()
    .domain(rates.map((rate) => rate.valid_from))
    .range([0, 1000]);
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
      className="flex-1 font-digit max-h-[100%] overflow-hidden flex flex-col"
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
            className={`flex gap-2 items-center p-2 select-none ${
              ind === priceNowIndex
                ? "shadow-md drop-shadow-[0_-1px_5px_rgba(20,0,30,0.4)] z-50"
                : ""
            }`}
            style={{ background: colorScale(rate.value_inc_vat) }}
            ref={ind === priceNowIndex ? currentPeriodRef : null}
          >
            <span className="text-xs font-bold text-black">
              {formatLocaleTimePeriod(rate.valid_from, rate.valid_to)}
            </span>
            <span className="text-4xl font-normal text-theme-950">
              <FormattedPrice price={rate.value_inc_vat} />
            </span>
            <span className="block flex-1 h-4 relative">
              <span
                className="absolute block h-4 w-1 border-l-theme-950/30 border-dashed border-l"
                style={{ left: `${xScale(priceAverage)}px` }}
              ></span>
              <span
                className="block h-4 bg-white/50"
                style={{ width: xScale(rate.value_inc_vat) }}
              ></span>
            </span>
          </li>
        ))}
    </ol>
  );
};
export default HalfHourlyChart;
