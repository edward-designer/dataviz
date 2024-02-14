import { IConsumptionData } from "@/data/source";
import {
  extent,
  scaleSequential,
  interpolateRdYlGn,
  select,
  scalePoint,
  scaleLinear,
  axisBottom,
  axisTop,
} from "d3";
import { PropsWithChildren, useEffect, useRef, useState } from "react";
import Loading from "../Loading";
import Remark from "./Remark";

interface IMissingDataToolChart extends PropsWithChildren {
  fromDate: Date;
  toDate: Date;
  data: { results: IConsumptionData[] };
  type: string;
  contractFrom: string | undefined;
}

const MissingDataToolChart = ({
  fromDate,
  toDate,
  data,
  type,
  contractFrom,
  children,
}: IMissingDataToolChart) => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  const [missingDataCount, setMissingDataCount] = useState(0);

  const cellLength = 14;
  const width = cellLength * 50;
  const noOfDays = Math.round(
    (new Date(toDate).valueOf() - new Date(fromDate).valueOf()) /
      (1000 * 60 * 60 * 24)
  );
  const height = cellLength * noOfDays * 1.5 + 80;

  const fontSize = 12;

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const dataResults = data.results as IConsumptionData[];

    const earliestReadingDate = contractFrom
      ? new Date(contractFrom).valueOf() > new Date(fromDate).valueOf()
        ? contractFrom
        : fromDate
      : fromDate;

    const filteredData = dataResults.filter(
      (d) =>
        new Date(d.interval_start).valueOf() >= new Date(fromDate).valueOf() &&
        new Date(d.interval_start).valueOf() <= new Date(toDate).valueOf()
    );

    const startDate =
      filteredData.length === 0
        ? Infinity
        : new Date(earliestReadingDate).getDate();

    const groupedData = Array.from({
      length: noOfDays,
    }).map((_, i) =>
      Array.from({ length: 48 }).fill(i >= startDate - 1 ? null : undefined)
    ) as (number | null | undefined)[][];

    filteredData.forEach((data) => {
      const index = (new Date(data.interval_start).getDate() - 1) % noOfDays;
      const session =
        new Date(data.interval_start).getHours() * 2 +
        Math.floor(new Date(data.interval_start).getMinutes() / 30);
      groupedData[index][session] = data.consumption;
    });

    const dataExtent = extent(filteredData, (d) => d.consumption);
    const dataMin = dataExtent[0]!;
    const dataMax = dataExtent[1]!;
    const colorScale = scaleSequential(interpolateRdYlGn).domain([
      dataMax,
      dataMin,
    ]);

    const svg = select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    const chartGroup = svg
      .select("g#chart")
      .attr("transform", `translate(0,${cellLength * 1.5})`)
      .selectAll("g.day")
      .data(groupedData)
      .join(
        (enter) => enter.append("g").classed("day", true),
        (update) => update,
        (exit) =>
          exit.call((g) =>
            g.transition().duration(100).style("opacity", 0).remove()
          )
      )
      .attr("transform", (_, i) => `translate(0,${i * cellLength * 1.5})`);

    svg
      .select("g#chart")
      .selectAll("g")
      .data(groupedData)
      .join("text")
      .append("text")
      .attr("x", 0)
      .attr("y", cellLength + fontSize)
      .attr("fill", "white")
      .attr("font-size", fontSize)
      .attr("alignment-baseline", "baseline")
      .text((d, i) => i + 1);

    chartGroup
      .selectAll("rect")
      .data((d) => d)
      .join(
        (enter) => enter.append("rect"),
        (update) => update.attr("x", 0),
        (exit) =>
          exit.call((g) =>
            g.transition().duration(250).style("opacity", 0).remove()
          )
      )
      .attr("width", cellLength - 1)
      .attr("height", cellLength - 1)
      .attr("y", cellLength)
      .attr("fill", (d, i) =>
        d === undefined
          ? "#000433"
          : d !== null
          ? colorScale(d)
          : "url(#diagonalHatch)"
      )
      .attr("stroke", (d, i) =>
        d === undefined ? "#002453" : d !== null ? "#000433" : "white"
      )
      .transition()
      .duration(500)
      .attr("x", (_, i) => (i + 2) * cellLength);

    const legendScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([0, 100]);
    const legendAxis = axisTop(legendScale)
      .tickValues([dataMin, dataMax])
      .tickPadding(10)
      .tickSize(10);

    if (filteredData.length > 0)
      svg
        .select<SVGGElement>("g.legend")
        .selectAll("g")
        .data([1])
        .join(
          (enter) => enter.append("g"),
          (update) => update,
          (exit) => exit.remove()
        )
        .append("rect")
        .attr("width", 100)
        .attr("height", 10)
        .attr("fill", "url(#legendGradient)")
        .attr("transform", "translate(0,-10)");

    if (filteredData.length > 0)
      svg.select<SVGGElement>("g.legend").call(legendAxis);

    setMissingDataCount(
      groupedData
        .filter((_, i) => i >= startDate - 1)
        .flat()
        .filter((data) => data === null).length
    );
  }, [contractFrom, data, fromDate, height, noOfDays, toDate, width]);

  if (!data) return <Loading />;

  return (
    <div className="flex w-full items-end flex-wrap-reverse gap-y-4">
      <div className="flex flex-col flex-1">
        <div className="text-accentPink-700 text-2xl flex">{children}</div>
        <div
          className="flex-1 max-w-[calc(100vw_-_100px)] overflow-auto"
          id="svgContainer"
        >
          <svg ref={svgRef}>
            <defs>
              <linearGradient id="legendGradient">
                <stop offset="0%" stop-color="#006837" />
                <stop offset="50%" stop-color="#fcf4ab" />
                <stop offset="100%" stop-color="#a50026" />
              </linearGradient>
              <pattern
                id="diagonalHatch"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
              >
                <path
                  d="M-1,1 l2,-2
           M0,4 l4,-4
           M3,5 l2,-2"
                  style={{ stroke: "white", strokeWidth: 1 }}
                />
              </pattern>
            </defs>
            <g id="chart" />
            <g transform={` translate(0,${cellLength})`}>
              <text fill="#4f72b8" x={cellLength * 2} y={12} fontSize={12}>
                00:00
              </text>
              <text
                fill="#4f72b8"
                x={cellLength * 50}
                y={12}
                fontSize={12}
                textAnchor="end"
              >
                24:00
              </text>
            </g>
            <g transform={` translate(0,${height - cellLength * 1.5})`}>
              <rect
                width={cellLength}
                height={cellLength}
                fill="url(#diagonalHatch)"
                stroke="white"
              />
              <text fill="white" x={cellLength * 1.5} y={12} fontSize={12}>
                missing data
              </text>
              <g transform={` translate(120,0)`}>
                <rect
                  width={cellLength}
                  height={cellLength}
                  stroke="#002453"
                  fill="#000433"
                />
                <text fill="white" x={cellLength * 1.5} y={12} fontSize={12}>
                  no data
                </text>
              </g>
            </g>
            <g
              transform={` translate(${cellLength * 16},${
                height - cellLength * 0.5
              })`}
              className="legend"
            >
              <text
                fill="white"
                x={cellLength * 1.5}
                y={12}
                fontSize={12}
                transform="translate(103,-32)"
              >
                {type === "G" ? `m` : "kWh"}
                {type === "G" && (
                  <tspan baseline-shift="super" fontSize={8}>
                    3
                  </tspan>
                )}
              </text>
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-accentPink-800 rounded-xl p-4">
        <span className="text-4xl">{missingDataCount}</span>
        <span className="text-xs flex items-end whitespace-nowrap">
          missing data{" "}
          <Remark>
            [Note: It may take a while for the data of the latest few days to
            appear.] In case there are excessive missing data, you may contact
            Octopus directly to request them to download again or to check
            whether they are having troubles collecting data from your smart
            meter. If there are problems with the smart meter data, Octopus will
            use manually submitted meter readings to estimate use for the
            missing periods.
          </Remark>
        </span>
      </div>
    </div>
  );
};

export default MissingDataToolChart;
