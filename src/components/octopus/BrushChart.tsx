"use client";
import { useEffect, useRef } from "react";

import {
  select,
  axisBottom,
  extent,
  max,
  scaleLinear,
  scaleTime,
  axisLeft,
  line,
  easeLinear,
  brushX,
  D3BrushEvent,
  Selection,
  Line,
  BaseType,
  pointer,
  bisector,
  curveStepAfter,
  axisRight,
} from "d3";
import toast from "react-hot-toast";

import { TariffType, TariffResult } from "@/data/source";

import useTariffQuery from "../../hooks/useTariffQuery";

import { assertExtentNotUndefined } from "../../utils/helpers";

import Loading from "@/components/Loading";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

const BrushChart = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: TariffType;
  gsp: string;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery({
      tariff,
      type,
      gsp,
    });

  let widgetWidth = 1000;
  let widgetHeight = 450;
  const padding = { top: 40, bottom: 40, left: 60, right: 20 };
  const axisColor = "#63acb8";
  if (typeof window !== "undefined") {
    widgetWidth = window.innerWidth;
  }

  useEffect(() => {
    if (!data || !svgRef) return;

    select(svgRef.current)
      .select("g.chartContainer")
      .attr("transform", `translate(${padding.left}, ${padding.top})`)
      .attr("fill", "red");
    const drawAxes = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>
    ) => {
      const xExtent = extent(
        data[0].results,
        (d) => new Date(d.valid_from) ?? new Date()
      );
      assertExtentNotUndefined<Date>(xExtent);
      const xScale = scaleTime()
        .domain(xExtent)
        .range([0, widgetWidth - padding.left - padding.right]);

      const maxPrice =
        max(
          data.find((tariff) => tariff.tariffType === "E")?.results ?? [],
          (data) => data?.value_inc_vat ?? 0
        ) ?? 0;
      const yScale = scaleLinear(
        [0, maxPrice + 5],
        [widgetHeight - padding.top - padding.bottom, 0]
      ).nice();

      const xAxis = axisBottom<Date>(xScale);
      const yGrid = axisRight<number>(yScale)
        .tickFormat((d) => "")
        .tickSizeInner(widgetWidth - padding.left - padding.right)
        .tickPadding(0);
      const yAxis = axisLeft<number>(yScale).tickFormat((d) => `${d}p`);

      const lineGenerator = line<TariffResult>()
        .x((d) => xScale(new Date(d.valid_from)))
        .y((d) => yScale(d.value_inc_vat))
        .curve(curveStepAfter);
      chart
        .select<SVGSVGElement>("g.grid")
        .attr("color", "#FFFFFF20")
        .transition()
        .call(yGrid);
      const xAxisGroup = chart
        .select<SVGSVGElement>("g.xAxis")
        .attr(
          "transform",
          `translate(0, ${widgetHeight - padding.top - padding.bottom})`
        )
        .attr("color", axisColor);
      xAxisGroup.transition().call(xAxis);
      chart
        .select<SVGSVGElement>("g.yAxis")
        .attr("color", axisColor)
        .transition()
        .call(yAxis);

      return {
        xAxis,
        yAxis,
        xExtent,
        xScale,
        yScale,
        xAxisGroup,
        lineGenerator,
      };
    };

    const drawLine = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>,
      data: [TariffResult[]],
      name: string,
      lineGenerator: Line<TariffResult>
    ) => {
      chart.select("g.chartContainer").append("g").classed(name, true);
      const line = chart
        .select<SVGPathElement>(`g.${name}`)
        .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data(data)
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("fill", "none")
              .attr("stroke", `url(#${name})`)
              .attr("stroke-width", 1.5),
          (update) => update.transition().duration(500),
          (exit) => exit.remove()
        );
      line.attr("d", lineGenerator);

      const length = (line.node() as SVGPathElement).getTotalLength() ?? 0;
      line
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", -length)
        .transition()
        .duration(500)
        .ease(easeLinear)
        .attr("stroke-dashoffset", 0);

      return line;
    };

    const drawBrush = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>,
      targetCharts: Selection<
        BaseType | SVGPathElement,
        TariffResult[],
        SVGPathElement,
        unknown
      >[],
      xExtent: [Date, Date]
    ) => {
      const clip = chart
        .select("defs")
        .append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", widgetWidth - padding.left - padding.right)
        .attr("height", widgetHeight - padding.top - padding.bottom)
        .attr("x", 0)
        .attr("y", 0);

      const updateChart = (
        event: D3BrushEvent<TariffResult>,
        targetCharts: Selection<
          BaseType | SVGPathElement,
          TariffResult[],
          SVGPathElement,
          unknown
        >[]
      ) => {
        targetCharts.map((chart) => chart.attr("stroke-dasharray", "0 0"));
        chart.select<SVGGElement>("g.brush").call(brushX().clear);
        const brushExtent = event.selection;
        if (!brushExtent) return;
        if (
          typeof brushExtent?.[0] === "number" &&
          typeof brushExtent?.[1] === "number"
        )
          xScale.domain([
            xScale.invert(brushExtent[0] - padding.left),
            xScale.invert(brushExtent[1] - padding.left),
          ]);
        xAxisGroup.transition().duration(1000).call(xAxis);
        targetCharts.map((chart) =>
          chart.transition().duration(1000).attr("d", lineGenerator)
        );
      };

      const chartBrush = brushX()
        .extent([
          [padding.left, padding.top],
          [widgetWidth - padding.right, widgetHeight - padding.bottom],
        ])
        .on("end", (event) => updateChart(event, targetCharts));
      chart.append("g").attr("class", "brush").call(chartBrush);

      chart.on("dblclick", () => {
        xScale.domain(xExtent);
        xAxisGroup.transition().duration(1000).call(xAxis);
        targetCharts.map((chart) =>
          chart.transition().duration(1000).attr("d", lineGenerator)
        );
      });

      return chartBrush;
    };

    const mouseInteraction = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>
    ) => {
      chart.on("pointermove", function (e: MouseEvent) {
        const coordinates = pointer(e);
        const mouseX = coordinates[0] - padding.left;
        const xValue = xScale.invert(mouseX);
        const bisectDate = bisector(
          (d: TariffResult) => new Date(d.valid_from)
        ).left;
        //bisector requires ASCENDING order
        const index =
          data[0].results.length -
          1 -
          bisectDate(
            [...data[0].results].sort(
              (a, b) =>
                new Date(a.valid_from).getTime() -
                new Date(b.valid_from).getTime()
            ),
            xValue
          );
        const pointValues = data.map((set) => [
          mouseX,
          set.results[index]?.value_inc_vat,
        ]);
        chart
          .select("g.mouseInteraction")
          .attr("clip-path", "url(#clip)")
          .selectAll("line")
          .data([mouseX])
          .join("line")
          .attr("x1", (d: number) => d)
          .attr("x2", (d: number) => d)
          .attr("y1", 0)
          .attr("y2", widgetHeight)
          .attr("stroke", "white")
          .attr("strokeWidth", 2)
          .attr("stroke-dasharray", "2 2");
        chart
          .select("g.mouseInteraction")
          .selectAll("circle")
          .data(pointValues)
          .join("circle")
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => yScale(d[1]))
          .attr("fill", "white")
          .attr("r", 4);
      });
    };

    /* draw charts */
    const chart = select(svgRef.current);
    const { xAxis, yAxis, xExtent, xScale, yScale, xAxisGroup, lineGenerator } =
      drawAxes(chart);
    const lineChart = drawLine(
      chart,
      [data[0].results],
      "electricity",
      lineGenerator
    );
    const lineChart2 = drawLine(chart, [data[1].results], "gas", lineGenerator);
    const chartBrush = drawBrush(chart, [lineChart, lineChart2], xExtent);
    mouseInteraction(chart);
  }, [
    data,
    padding.bottom,
    padding.left,
    padding.right,
    padding.top,
    widgetHeight,
    widgetWidth,
  ]);

  return (
    <div className="relative flex-1 flex items-center justify-center flex-col h-[450px] rounded-xl bg-theme-950 border border-accentPink-900/50 shadow-inner">
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess && (
        <svg
          width={widgetWidth}
          height={widgetHeight}
          viewBox={`0, 0, ${widgetWidth}, ${widgetHeight}`}
          ref={svgRef}
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="electricity" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#aa33cc" />
              <stop offset="50%" stopColor="#3377bb" />
              <stop offset="100%" stopColor="#aaffdd" />
            </linearGradient>
            <linearGradient id="gas" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="red" />
              <stop offset="50%" stopColor="green" />
              <stop offset="100%" stopColor="yellow" />
            </linearGradient>
          </defs>
          <g className="chartContainer">
            <g className="grid" />
            <g className="xAxis" />
            <g className="yAxis" />
            <g className="mouseInteraction" />
          </g>
        </svg>
      )}
    </div>
  );
};

export default BrushChart;
