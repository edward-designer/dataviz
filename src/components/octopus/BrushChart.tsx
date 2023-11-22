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
  timeFormat,
  timeMonth,
  utcSecond,
  utcDay,
  utcHour,
  utcMinute,
  utcMonth,
  utcWeek,
  utcYear,
  utcFormat,
  timeFormatDefaultLocale,
} from "d3";
import toast from "react-hot-toast";

import {
  TariffType,
  TariffResult,
  ENERGY_TYPE,
  ENERGY_TYPE_ICON,
  priceCap,
} from "@/data/source";

import useTariffQuery from "../../hooks/useTariffQuery";

import { assertExtentNotUndefined, evenRound } from "../../utils/helpers";

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
  const fontSize = 14;
  const leadingSize = fontSize * 1.5;
  const innerPadding = 10;
  const padding = { top: 40, bottom: 60, left: 80, right: 20 };
  const axisColor = "#63acb8";
  if (typeof document !== "undefined") {
    widgetWidth =
      document.querySelector(".chartDiv")?.getBoundingClientRect().width ??
      widgetWidth;
  }

  useEffect(() => {
    if (!data || !svgRef) return;

    // add clip
    select(svgRef.current)
      .select("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", widgetWidth - padding.left - padding.right)
      .attr("height", widgetHeight - padding.top - padding.bottom)
      .attr("x", 0)
      .attr("y", 0);

    // translate
    select(svgRef.current)
      .selectAll("g.chartContainer, g.interactionContainer")
      .attr("transform", `translate(${padding.left}, ${padding.top})`);

    const drawAxes = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>
    ) => {
      const xExtent = extent(
        data
          .map((dataset) =>
            extent(dataset.results, (d) => new Date(d.valid_to) ?? new Date())
          )
          .flat(),
        (d) => d
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

      const xAxis = axisBottom<Date>(xScale).ticks(widgetWidth / 130);
      const yGrid = axisRight<number>(yScale)
        .tickFormat((d) => "")
        .tickSizeInner(widgetWidth - padding.left - padding.right)
        .tickPadding(0);
      const yAxis = axisLeft<number>(yScale).tickFormat((d) => `${d}p`);

      const lineGenerator = line<TariffResult>()
        .x((d) => xScale(new Date(d.valid_to)))
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

      chart.select(".yAxisText").remove();
      chart
        .select(".yAxis")
        .append("text")
        .classed("yAxisText", true)
        .classed("axisText", true)
        .text("Unit Rate")
        .attr(
          "transform",
          `translate(-${padding.left / 2} ${
            widgetHeight / 2 - padding.top
          }) rotate(-90)`
        )
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("alignment-basline", "baseline")
        .attr("font-size", "14")
        .attr("fill", axisColor);

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

    const drawCurrentCap = (
      chart: Selection<SVGSVGElement | null, unknown, null, undefined>
    ) => {
      chart
        .select(".cap")
        .select(".capE")
        .text("current electricity price cap (for flexible plan only)")
        .attr("transform", "translate(0 -5)")
        .attr("text-anchor", "end")
        .attr("alignment-basline", "baseline")
        .attr("font-size", "10")
        .attr("fill", "#aa33cc")
        .attr("x", widgetWidth - padding.right - padding.left)
        .transition()
        .duration(500)
        .attr("y", yScale(priceCap.E));

      chart
        .select(".cap")
        .select(".capG")
        .text("current gas price cap (for flexible plan only)")
        .attr("transform", "translate(0 -5)")
        .attr("text-anchor", "end")
        .attr("alignment-basline", "baseline")
        .attr("font-size", "10")
        .attr("fill", "#FF0000AA")
        .attr("x", widgetWidth - padding.right - padding.left)
        .transition()
        .duration(500)
        .attr("y", yScale(priceCap.G));

      chart
        .select(".cap")
        .attr("clip-path", "url(#clip)")
        .selectAll("line")
        .data(Object.entries(priceCap))
        .join("line")
        .attr("x1", 0)
        .attr("x2", widgetWidth)
        .attr("stroke", (d) => (d[0] === "E" ? "#aa33cc80" : "#FF000080"))
        .attr("strokeWidth", 1)
        .attr("stroke-dasharray", "2 2")
        .transition()
        .duration(500)
        .attr("y1", (d) => yScale(d[1]))
        .attr("y2", (d) => yScale(d[1]));
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
          (d: TariffResult) => new Date(d.valid_to)
        ).left;
        //bisector requires ASCENDING order
        const index =
          data[0].results.length -
          1 -
          bisectDate(
            [...data[0].results].sort(
              (a, b) =>
                new Date(a.valid_to).getTime() - new Date(b.valid_to).getTime()
            ),
            xValue
          );

        const dateAtZeroHour = xValue.setHours(0, 0, 0, 0);
        const pointValues = data.map((set) => {
          return [
            mouseX,
            set.results.find(
              (result) =>
                new Date(result.valid_from).getTime() === dateAtZeroHour
            )?.value_inc_vat ?? "--",
            ENERGY_TYPE_ICON[set.tariffType],
          ] as const;
        });

        const tooltipWidth =
          document.querySelector(".tooltip")?.getBoundingClientRect()?.width ??
          0;

        const tooltipLeft =
          widgetWidth - (mouseX + padding.left + 20) < tooltipWidth
            ? mouseX - 10 - tooltipWidth
            : mouseX + 10;

        select(".tooltip")
          .attr("opacity", "1")
          .transition()
          .duration(20)
          .style("transform", `translate(${tooltipLeft}px, ${padding.top}px)`);
        select(".date")
          .selectAll("text")
          .data([xValue])
          .join("text")
          .attr("fill", "#FFFFFF80")
          .attr("alignment-baseline", "hanging")
          .text(xValue.toLocaleDateString());
        select(".price")
          .selectAll("text")
          .data(pointValues)
          .join("text")
          .attr("alignment-baseline", "hanging")
          .attr("fill", "white")
          .attr("transform", (d, i) => `translate (0 ${i * leadingSize})`)
          .text((d) => {
            if (typeof d[1] === "number")
              return `${d[2]} ${evenRound(d[1], 2)}p`;
            if (typeof d[1] === "string") return `${d[2]} ${d[1]}`;
            return "--";
          });

        if (pointValues.every((point) => typeof point[1] !== "number"))
          select(".tooltip").attr("opacity", 0);

        chart
          .select("g.mouseInteraction")
          .attr("clip-path", "url(#clip)")
          .selectAll("circle")
          .data(pointValues)
          .join("circle")
          .transition()
          .duration(20)
          .attr("cx", (d) => d[0])
          .attr("cy", (d) => {
            if (typeof d[1] === "number") return yScale(d[1]);
            return 0;
          })
          .attr("fill", "white")
          .attr("r", 4);
        chart
          .select("g.mouseInteraction")
          .attr("clip-path", "url(#clip)")
          .selectAll("line")
          .data([mouseX])
          .join("line")
          .transition()
          .duration(20)
          .attr("x1", (d: number) => d)
          .attr("x2", (d: number) => d)
          .attr("y1", 0)
          .attr("y2", widgetHeight)
          .attr("stroke", "white")
          .attr("strokeWidth", 2)
          .attr("stroke-dasharray", "2 2");
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
    drawCurrentCap(chart);
    mouseInteraction(chart);
  }, [
    data,
    leadingSize,
    padding.bottom,
    padding.left,
    padding.right,
    padding.top,
    widgetHeight,
    widgetWidth,
  ]);

  return (
    <div className="chartDiv relative w-full h-[450px] flex-1 flex items-center justify-center flex-col rounded-xl bg-theme-950 border border-accentPink-700/50 shadow-inner overflow-hidden">
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}

      <>
        <svg
          width={widgetWidth}
          height={widgetHeight}
          viewBox={`0, 0, ${widgetWidth}, ${widgetHeight}`}
          ref={svgRef}
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
            <g className="cap">
              <text className="capE"></text>
              <text className="capG"></text>
            </g>
          </g>
          <g className="interactionContainer">
            <g className="mouseInteraction" />
            <g className="tooltip" opacity="0">
              <rect
                width="150"
                height={leadingSize * 3 + innerPadding * 2}
                rx={leadingSize / 2}
                fill="#00000060"
                x="0"
                y="0"
              />
              <g
                className="date"
                transform={`translate(${innerPadding} ${innerPadding})`}
              />
              <g
                className="price"
                transform={`translate(${innerPadding} ${
                  leadingSize + innerPadding
                })`}
              />
            </g>
          </g>
        </svg>
      </>
    </div>
  );
};

export default BrushChart;
