import useTariffQueryYearlyAverage from "@/hooks/useTariffQueryYearlyAverage";
import useYearlyConsumptionPattern from "@/hooks/useYearlyConsumptionPattern";
import {
  formatNumberToDisplay,
  formatPriceChangeWithSign,
  getCategory,
  selectOrAppend,
} from "@/utils/helpers";
import {
  ScaleLinear,
  Selection,
  axisBottom,
  axisLeft,
  axisRight,
  curveCardinal,
  easeLinear,
  extent,
  line,
  scaleLinear,
  select,
} from "d3";
import { useContext, useEffect, useRef } from "react";
import { LuArrowUpDown } from "react-icons/lu";
import { TbZoomMoney } from "react-icons/tb";

import Loading from "../Loading";
import EnergyShiftSimCostContainer from "./EnergyShiftSimCostContainer";
import Lottie from "lottie-react";
import emojiSad from "../../../public/lottie/emojiSad.json";

import Link from "next/link";
import { WindowResizeContext } from "@/context/windowResize";

const xAxisLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ITariffHoppingChart {
  importTariff: string;
  exportTariff: string;
  importTariff2: string;
  exportTariff2: string;
  isExporting?: boolean;
}

const TariffHoppingChart = ({
  importTariff,
  exportTariff,
  importTariff2,
  exportTariff2,
  isExporting = true,
}: ITariffHoppingChart) => {
  const { width } = useContext(WindowResizeContext);

  const { dataByTimeYearly, isLoading } = useYearlyConsumptionPattern({
    fromDate: "",
    toDate: "",
    isExport: false,
    type: "E",
  });
  const {
    dataByTimeYearly: dataByTimeYearlyExport,
    isLoading: isLoadingExport,
  } = useYearlyConsumptionPattern({
    fromDate: "",
    toDate: "",
    isExport: true,
    type: "E",
  });

  const {
    dataByTimeYearly: dataByTimeYearlyTariff,
    isLoading: isLoadingTariff,
  } = useTariffQueryYearlyAverage({
    tariff: importTariff,
    type: "E",
    fromDate: "",
    toDate: "",
    category: getCategory(importTariff),
  });
  const {
    dataByTimeYearly: dataByTimeYearlyTariffExport,
    isLoading: isLoadingTariffExport,
  } = useTariffQueryYearlyAverage({
    tariff: exportTariff,
    type: "E",
    fromDate: "",
    toDate: "",
    category: getCategory(exportTariff),
  });

  const {
    dataByTimeYearly: dataByTimeYearlyTariff2,
    isLoading: isLoadingTariff2,
  } = useTariffQueryYearlyAverage({
    tariff: importTariff2,
    type: "E",
    fromDate: "",
    toDate: "",
    category: getCategory(importTariff2),
  });
  const {
    dataByTimeYearly: dataByTimeYearlyTariffExport2,
    isLoading: isLoadingTariffExport2,
  } = useTariffQueryYearlyAverage({
    tariff: exportTariff2,
    type: "E",
    fromDate: "",
    toDate: "",
    category: getCategory(exportTariff2),
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Specify chart properties (dimensions and colors)
  let widgetWidth = 1000;
  let widgetHeight = 450;
  const fontSize = 12;
  const leadingSize = fontSize * 1.5;
  const padding = { top: 40, bottom: 60, left: 70, right: 20 };
  const axisColor = "#63acb8";

  const dataByTimeImportInPounds =
    dataByTimeYearly && dataByTimeYearlyTariff
      ? dataByTimeYearly.map((dataByTimeMonth, i) =>
          dataByTimeMonth.reduce(
            (acc, cur, j) => (dataByTimeYearlyTariff[i][j] * cur) / 100 + acc,
            0
          )
        )
      : [];
  const dataByTimeExportInPounds =
    isExporting && dataByTimeYearlyExport && dataByTimeYearlyTariffExport
      ? dataByTimeYearlyExport.map((dataByTimeMonth, i) =>
          dataByTimeMonth.reduce(
            (acc, cur, j) =>
              (dataByTimeYearlyTariffExport[i][j] * cur) / 100 + acc,
            0
          )
        )
      : [];

  const dataByTimeImportInPounds2 =
    dataByTimeYearly && dataByTimeYearlyTariff2
      ? dataByTimeYearly.map((dataByTimeMonth, i) =>
          dataByTimeMonth.reduce(
            (acc, cur, j) => (dataByTimeYearlyTariff2[i][j] * cur) / 100 + acc,
            0
          )
        )
      : [];
  const dataByTimeExportInPounds2 =
    isExporting && dataByTimeYearlyExport && dataByTimeYearlyTariffExport2
      ? dataByTimeYearlyExport.map((dataByTimeMonth, i) =>
          dataByTimeMonth.reduce(
            (acc, cur, j) =>
              (dataByTimeYearlyTariffExport2[i][j] * cur) / 100 + acc,
            0
          )
        )
      : [];

  const dataByTimeResultsInPounds =
    isExporting &&
    dataByTimeExportInPounds.length > 0 &&
    dataByTimeImportInPounds.length > 0
      ? dataByTimeImportInPounds.map(
          (value, i) => value - dataByTimeExportInPounds[i]
        )
      : !isExporting
      ? dataByTimeImportInPounds
      : [];
  const dataByTimeResultsInPounds2 =
    dataByTimeExportInPounds2.length > 0 && dataByTimeImportInPounds2.length > 0
      ? dataByTimeImportInPounds2.map(
          (value, i) => value - dataByTimeExportInPounds2[i]
        )
      : !isExporting
      ? dataByTimeImportInPounds2
      : [];

  useEffect(() => {
    if (
      (isExporting &&
        (!dataByTimeYearly ||
          !dataByTimeYearlyExport ||
          !dataByTimeYearlyTariff ||
          !dataByTimeYearlyTariff2 ||
          !dataByTimeYearlyTariffExport ||
          !dataByTimeYearlyTariffExport2 ||
          !svgRef.current)) ||
      (!isExporting &&
        (!dataByTimeYearly ||
          !dataByTimeYearlyTariff ||
          !dataByTimeYearlyTariff2 ||
          !svgRef.current))
    )
      return;

    if (typeof document !== "undefined") {
      widgetWidth =
        // hack to ensure width of widget is responsive to container width
        // eslint-disable-next-line react-hooks/exhaustive-deps
        (document
          .getElementById(`tariffHoppingContainer`)
          ?.getBoundingClientRect().width ?? widgetWidth) -
        padding.right -
        40;
    }
    const chart = select(svgRef.current) as Selection<
      SVGSVGElement,
      unknown,
      null,
      undefined
    >;
    // Add attr to svg
    chart
      .attr("width", widgetWidth)
      .attr("height", widgetHeight)
      .attr("viewBox", `0, 0, ${widgetWidth}, ${widgetHeight}`);
    chart
      .selectAll("g.chartContainer, g.lines")
      .attr("transform", `translate(${padding.left}, ${padding.top})`);
    const xExtent = [0, 11];
    const yExtentOriginal = extent(dataByTimeResultsInPounds) as [
      number,
      number
    ];
    const yExtentCompare = extent(dataByTimeResultsInPounds2) as [
      number,
      number
    ];
    const yExtent = [
      Math.min(yExtentCompare[0], yExtentOriginal[0]) - 20,
      Math.max(yExtentCompare[1], yExtentOriginal[1]) + 20,
    ];

    const xScale = scaleLinear(xExtent, [
      0,
      widgetWidth - padding.left - padding.right,
    ]).nice();
    const yScale = scaleLinear(
      [yExtent[0], yExtent[1]],
      [widgetHeight - padding.top - padding.bottom, 0]
    ).nice();

    const drawAxes = (
      xScale: ScaleLinear<number, number, never>,
      yScale: ScaleLinear<number, number, never>
    ) => {
      const yGrid = axisRight<number>(yScale)
        .tickFormat((d) => "")
        .tickSizeInner(widgetWidth - padding.left - padding.right)
        .tickPadding(0);
      const yAxis = axisLeft<number>(yScale).tickFormat((d) => `£${d}`);
      const xAxis = axisBottom<number>(xScale)
        .ticks(12)
        .tickFormat((_, i) => xAxisLabels[i]);
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
      chart
        .select(".yAxis")
        .selectAll("line")
        .data([yScale(0)])
        .join("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", (d) => d)
        .attr("y2", (d) => d)
        .attr("stroke-width", "2")
        .attr("stroke", "#63acb8")
        .transition()
        .duration(20)
        .attr("x2", widgetWidth - padding.left - padding.right - 40);

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
        .text("Net Energy Cost")
        .attr(
          "transform",
          `translate(-${padding.left - leadingSize} ${
            widgetHeight / 2
          }) rotate(-90)`
        )
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("alignment-basline", "baseline")
        .attr("font-size", "14")
        .attr("fill", axisColor);
    };

    const lineGeneratorFunc = (
      xScale: ScaleLinear<number, number, never>,
      yScale: ScaleLinear<number, number, never>
    ) =>
      line<number>()
        .x((d, i) => xScale(i))
        .y((d) => yScale(d))
        .curve(curveCardinal);

    // Function to actually draw lines
    const drawLine = (
      data: [number[]],
      name: string,
      xScale: ScaleLinear<number, number, never>,
      yScale: ScaleLinear<number, number, never>,
      drawAnimate: boolean = false,
      color: string = "green"
    ) => {
      const lineGenerator = lineGeneratorFunc(xScale, yScale);
      const lineGraph = selectOrAppend("g", name, chart.select("g.lines")).attr(
        "transform",
        `translate(0,0)`
      );
      if (typeof lineGraph === "string")
        throw new Error("Selection is not a string");
      const line = lineGraph
        .selectAll("path")
        .data(data)
        .join(
          (enter) =>
            enter
              .append<SVGPathElement>("path")
              .attr("fill", "none")
              .attr("stroke", color)
              .attr("stroke-width", 1.5),
          (update) => update.transition().duration(500),
          (exit) => exit.remove()
        )
        .attr("d", lineGenerator)
        .attr("stroke", color);

      if (drawAnimate) {
        /* Line animation - simulate draw from left to rigth NOTE: for first time only */
        const length = (line.node() as SVGPathElement).getTotalLength() ?? 0;
        line
          .attr("stroke-dasharray", length + " " + length)
          .attr("stroke-dashoffset", length)
          .transition()
          .duration(500)
          .ease(easeLinear)
          .attr("stroke-dashoffset", 0);
      }

      return line;
    };

    drawAxes(xScale, yScale);
    drawLine([dataByTimeResultsInPounds], "placeholder", xScale, yScale, true);
    drawLine(
      [dataByTimeResultsInPounds2],
      "placeholder2",
      xScale,
      yScale,
      true,
      "grey"
    );
  }, [
    dataByTimeYearly,
    dataByTimeYearlyExport,
    dataByTimeYearlyTariff,
    dataByTimeYearlyTariff2,
    dataByTimeYearlyTariffExport,
    dataByTimeYearlyTariffExport2,
    leadingSize,
    padding.bottom,
    padding.left,
    padding.right,
    padding.top,
    widgetHeight,
    widgetWidth,
    xAxisLabels,
    width,
  ]);

  if (
    !isExporting &&
    (!dataByTimeYearly || !dataByTimeYearlyTariff || !dataByTimeYearlyTariff2)
  )
    return <Loading />;
  if (
    isExporting &&
    (!dataByTimeYearly ||
      !dataByTimeYearlyTariff ||
      !dataByTimeYearlyTariff2 ||
      !dataByTimeYearlyExport ||
      !dataByTimeYearlyTariffExport ||
      !dataByTimeYearlyTariffExport2)
  )
    return <Loading />;

  let switchMonths: number[] = [];
  let currentWinner = 0;
  const cost = dataByTimeImportInPounds.reduce((acc, cur) => acc + cur, 0);
  const earning = dataByTimeExportInPounds.reduce((acc, cur) => acc + cur, 0);
  const cost2 = dataByTimeImportInPounds2.reduce((acc, cur) => acc + cur, 0);
  const earning2 = dataByTimeExportInPounds2.reduce((acc, cur) => acc + cur, 0);
  const baseNetCost =
    cost - earning > cost2 - earning2 ? cost2 - earning2 : cost - earning;
  const hoppedNetCost = xAxisLabels.reduce((acc, cur, i) => {
    if (
      dataByTimeImportInPounds[i] - dataByTimeExportInPounds[i] >
      dataByTimeImportInPounds2[i] - dataByTimeExportInPounds2[i]
    ) {
      if (currentWinner === 0) currentWinner = 1;
      if (currentWinner === 2) {
        switchMonths.push(i);
        currentWinner = 1;
      }
      return dataByTimeImportInPounds2[i] - dataByTimeExportInPounds2[i] + acc;
    } else {
      if (currentWinner === 0) currentWinner = 2;
      if (currentWinner === 1) {
        switchMonths.push(i);
        currentWinner = 2;
      }
      return dataByTimeImportInPounds[i] - dataByTimeExportInPounds[i] + acc;
    }
  }, 0);
  const difference = baseNetCost - hoppedNetCost;
  switchMonths.sort();
  const analyzedSwitchMonths = switchMonths.filter((month, i) =>
    i < switchMonths.length - 1 ? switchMonths[i + 1] - month >= 4 : true
  );
  const savingCondition =
    analyzedSwitchMonths.length === 2 ? (
      <span className="text-sm text-accentBlue-500">
        switch at around {xAxisLabels[analyzedSwitchMonths[0] - 1]} &{" "}
        {xAxisLabels[analyzedSwitchMonths[1]]}
      </span>
    ) : (
      ""
    );
  const hasEmptyValues =
    dataByTimeYearly?.some((month) => month.every((value) => value === 0)) &&
    dataByTimeYearlyExport?.some((month) =>
      month.every((value) => value === 0)
    );
  return (
    <>
      {hasEmptyValues && (
        <div className="flex flex-col min-h-[400px] justify-center items-center text-center">
          <Lottie
            animationData={emojiSad}
            aria-hidden={true}
            className="w-20 h-20 mb-4"
          />
          <span>
            We know it is so frustrating... but sorry, please wait for at least
            one year with Octopus to get accurate results.
          </span>
          <Link
            href="/compare"
            className="text-accentBlue-500 underline hover:text-accentPink-500 hover:no-underline"
          >
            Do check out other tools to help you save money!
          </Link>
        </div>
      )}
      <div className="flex flex-col flex-wrap-reverse md:flex-row md:flex-nowrap gap-4">
        <div
          id="tariffHoppingContainer"
          className="flex basis-3/4 flex-col flex-grow border border-accentPink-900 rounded-2xl items-between justity-between p-4"
        >
          <div className="flex flex-col gap-2">
            <svg ref={svgRef}>
              <g className="lines" />
              <g className="chartContainer">
                <g className="grid" />
                <g className="xAxis" />
                <g className="yAxis" />
              </g>
            </svg>
            <div className="flex justify-center">
              <table
                cellPadding={4}
                className="w-full lg:w-1/2 border-2 border-dotted border-slate-800"
              >
                <caption className="font-display text-3xl text-accentPink-500 mb-3">
                  Comparision of Costs of Tariff Sets{" "}
                  <span className="block font-sans text-base text-accentBlue-500">
                    (&quot;-£&quot; means credit)
                  </span>
                </caption>
                <thead>
                  <tr className="border-b-2 border-dotted border-slate-800">
                    <th>Month</th>
                    <th className="font-display text-2xl text-green-700 border-l-2 border-l-green-700">
                      Set 1
                    </th>
                    <th className="font-display text-2xl text-slate-500 border-l-2 border-l-slate-500">
                      Set 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {xAxisLabels.map((month, i) => (
                    <tr
                      key={month}
                      className="border-b-2 border-dotted border-slate-800"
                    >
                      <td className="text-center">{month}</td>
                      <td
                        className={`text-center border-l-2 border-l-green-700 ${
                          dataByTimeResultsInPounds[i] <
                          dataByTimeResultsInPounds2[i]
                            ? "bg-green-700"
                            : ""
                        }`}
                      >
                        {formatPriceChangeWithSign(
                          dataByTimeResultsInPounds[i],
                          false
                        )}
                      </td>
                      <td
                        className={`text-center border-l-2 border-l-slate-500 ${
                          dataByTimeResultsInPounds[i] >
                          dataByTimeResultsInPounds2[i]
                            ? "bg-slate-500"
                            : ""
                        }`}
                      >
                        {formatPriceChangeWithSign(
                          dataByTimeResultsInPounds2[i],
                          false
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow basis-1/4 border border-accentPink-900 rounded-2xl items-between justity-between">
          <div>
            <div className="flex w-full flex-col justify-between items-center px-4 py-4 gap-1 border-b-2 border-dotted border-accentPink-800">
              <div className="flex w-full justify-between items-center">
                <h3 className="flex flex-col gap-1 ">
                  <div className="flex flex-row items-center gap-1">
                    <TbZoomMoney className="w-6 h-6 " />
                    Potential Saving
                  </div>
                  {savingCondition}
                </h3>
                <div
                  className={`flex flex-1 flex-row items-center text-right min-h-[40px] ${
                    typeof difference === "number"
                      ? formatNumberToDisplay(difference) > 0
                        ? "text-[#85f9ad]"
                        : formatNumberToDisplay(difference) < 0
                        ? "text-[#f985c5]"
                        : "text-white"
                      : "text-white"
                  }`}
                >
                  <span
                    className={`flex-1 text-3xl font-bold flex justify-end whitespace-nowrap`}
                  >
                    {typeof difference === "number"
                      ? formatPriceChangeWithSign(difference)
                      : difference}
                  </span>
                </div>
              </div>
            </div>

            <EnergyShiftSimCostContainer
              label="Set 1 Tariffs"
              importTariff={importTariff}
              importCost={cost}
              exportTariff={exportTariff}
              exportEarning={earning}
              hasExport={isExporting}
              variant="current"
            />
            <div className="flex justify-center h-3">
              <LuArrowUpDown className="h-8 w-8 relative -top-1 text-accentPink-500" />
            </div>
            <EnergyShiftSimCostContainer
              label="Set 2 Tariffs"
              importTariff={importTariff2}
              importCost={cost2}
              exportTariff={exportTariff2}
              exportEarning={earning2}
              hasExport={isExporting}
            />
          </div>
          <div className="flex-grow flex flex-col justify-end p-4 gap-1 text-slate-400">
            <div className="text-sm text-accentPink-500">Remarks:</div>
            <div className="text-xs">
              <strong>Flux/Intelligent Flux</strong>: a tariff for both import
              and export at the same time, must have a (compatible) solar system
              and home battery
            </div>
            <div className="text-xs">
              <strong>Go</strong>: must have EV and (compatible) home charger,
              can only select Fixed Lite Export
            </div>
            <div className="text-xs">
              <strong>Cosy</strong>: must have a heat pump
            </div>
            <div className="text-xs">
              Figures above are estimations only. Past results do not guarantee
              future performance.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TariffHoppingChart;
