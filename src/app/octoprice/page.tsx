"use client";

/*
 * global states: (postcode), gsp, (api key, account number) => to be stored in localstorage
*  server states: products/tariff 
https://api.octopus.energy/v1/products/?brand=OCTOPUS_ENERGY

tracker code:
<select id="P1_TRACKER" name="P1_TRACKER" class="selectlist apex-item-select" data-native-menu="false" size="1" onchange="apex.submit('P1_TRACKER');"><option value="">Please select...</option>
<option value="SILVER-FLEX-BB-23-02-08" selected="selected">Tracker February 2023 v1</option>
<option value="SILVER-FLEX-22-11-25">Tracker Nov 2022 V1</option>
<option value="SILVER-VAR-22-10-21">Tracker Oct 2022 V1</option>
<option value="SILVER-22-08-31">Tracker Aug 2022 V1</option>
<option value="SILVER-22-07-22">Tracker Jul 2022 V1</option>
<option value="SILVER-22-04-25">Tracker V3 (Apr 2022)</option>
<option value="SILVER-2017-1">Tracker V1</option>
</select>

tracker formula (https://octopus.energy/tracker-faqs/) https://www.guylipman.com/octopus/formulas
bill calculator https://www.guylipman.com/octopus/bill_agile.html?startdate=2020-03-23&enddate=2020-03-31

get gsp:
https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=RG19

get all products
https://api.octopus.energy/v1/products/

get a month of agile tariff
https://api.octopus.energy/v1/products/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-A/standard-unit-rates/?page_size=1500

Phase 1
- live dashboard data for all tariffs
- set postcode for gsp (https://opennetzero.org/dataset/gis-boundaries-for-gb-grid-supply-points)
- comparision of current rate (no historical tariffs)
- tracker and agile

| header + postcode lookup |
| select       |
| elect | gas |
| trend        |
| different tariff |
| regional diff   |


Phase 2
- accept api key (note: override gsp via postcode)
- compare all traiffs


Phase 3
- forecast (https://opennetzero.org/dataset/oe-03782949-elexon_insights_14d_generation_forecast_summary   need saving to db)
- energy end use
*/
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  zoom,
  pointer,
  bisector,
  curveStepAfter,
  axisRight,
} from "d3";
import Lottie from "lottie-react";
import electricityIcon from "../../../public/lottie/electricity.json";
import gasIcon from "../../../public/lottie/gas.json";

import {
  assertExtentNotUndefined,
  fetchApi,
  isToday,
  priceAccessor,
} from "../../utils/helpers";
import {
  TRACKER,
  ENERGY_TYPE,
  queryTariffResult,
  TariffType,
  tariffResult,
  ApiTariffType,
  priceCap,
} from "@/data/source";

import { UserContext } from "@/context/user";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Badge from "@/components/octopus/Badge";
import Loading from "@/components/Loading";

import Comparison from "@/components/octopus/Comparison";

import backgroundE from "../../../public/images/E.jpg";
import backgroundG from "../../../public/images/G.jpg";
import { PopoverProps } from "@radix-ui/react-popover";
import Remark from "../../components/octopus/Remark";

const Octoprice = () => {
  const [tariff, setTariff] = useState(TRACKER[0].code);
  const {
    value: { gsp },
  } = useContext(UserContext);

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <div className="flex items-center justify-center font-display">
          <Select
            onValueChange={(value: string) => setTariff(value)}
            defaultValue={tariff}
          >
            <SelectTrigger className="w-auto max-w-full text-xl md:text-4xl text-accentBlue-400 flex items-center justify-center">
              <SelectValue placeholder="Select a Tariff" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-slate-500">
                  - Octopus Tracker Plan -
                </SelectLabel>
                {TRACKER.map(({ code, name, currentPlan }) => (
                  <SelectItem key={code} value={code}>
                    {name}
                    {currentPlan && <Badge label="CURRENT" />}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <PricePane tariff={tariff} type="E" gsp={gsp} />
        <PricePane tariff={tariff} type="G" gsp={gsp} />
      </section>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart tariff={tariff} type="EG" gsp={gsp} />
      </section>
    </div>
  );
};

export default Octoprice;

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
  const { isLoading, isError, isSuccess, data, error } = useTariffQuery({
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

      const lineGenerator = line<tariffResult>()
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
      data: [tariffResult[]],
      name: string,
      lineGenerator: Line<tariffResult>
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
        tariffResult[],
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
        event: D3BrushEvent<tariffResult>,
        targetCharts: Selection<
          BaseType | SVGPathElement,
          tariffResult[],
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
          (d: tariffResult) => new Date(d.valid_from)
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

  if (isLoading || !data || !data[0].results)
    return (
      <div className="relative flex-1 flex items-center justify-center flex-col h-[450px] rounded-xl bg-theme-950 border border-accentPink-900/50 shadow-inner">
        <Loading />
      </div>
    );

  return (
    <div className="flex-1 flex items-center justify-center flex-col h-[450px] rounded-xl bg-theme-950 border border-accentPink-900/50 shadow-inner">
      <svg
        width={widgetWidth}
        height={widgetHeight}
        viewBox={`0, 0, ${widgetWidth}, ${widgetHeight}`}
        ref={svgRef}
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="electricity" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cc33ff" />
            <stop offset="50%" stopColor="#3399ff" />
            <stop offset="100%" stopColor="#66ffcc" />
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
    </div>
  );
};

const PricePane = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
}) => {
  const { isLoading, isError, isSuccess, data, error } = useTariffQuery({
    tariff,
    type,
    gsp,
  });
  const results = data?.[0]?.results ?? [];
  const priceTodayIndex = results.findIndex((data) =>
    isToday(new Date(data.valid_from))
  );

  const priceYesterday = priceAccessor(results, priceTodayIndex + 1) ?? 0;
  const priceToday = priceAccessor(results, priceTodayIndex) ?? 0;
  const priceTomorrow =
    priceTodayIndex > 0 ? priceAccessor(results, priceTodayIndex - 1) : "--";
  const priceTomorrowDisplay =
    typeof priceTomorrow === "number" ? (
      <>
        {priceTomorrow}
        <span className="text-sm font-thin font-sans pl-1">p</span>
      </>
    ) : (
      <>
        --
        <Remark>
          Tomorrow’s rates is usually available between 11.00am and 6.00pm
        </Remark>
      </>
    );
  return (
    <div
      className="relative flex-1 flex flex-col gap-8 min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-900/50 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% ),url(${
          type === "E" ? backgroundE.src : backgroundG.src
        })`,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-1 self-start flex-col">
            <Badge
              label={`Today - ${new Date().toLocaleDateString()}`}
              variant="secondary"
            />
            <div className="font-digit text-6xl text-white flex flex-col items-start gap-1">
              <div>
                {priceToday}
                <span className="text-sm font-sans font-thin pl-1">p</span>
              </div>
              <div className="flex">
                <Comparison
                  change={
                    priceToday !== 0
                      ? parseInt(
                          (
                            ((priceToday - priceYesterday) / priceYesterday) *
                            100
                          ).toFixed(0)
                        )
                      : null
                  }
                  compare="yesterday"
                />

                <Comparison
                  change={
                    priceToday !== 0
                      ? parseInt(
                          (
                            ((priceToday - priceCap[type]) / priceCap[type]) *
                            100
                          ).toFixed(0)
                        )
                      : null
                  }
                  compare="price cap"
                >
                  <Remark variant="badge">
                    The{" "}
                    <a
                      href="https://www.ofgem.gov.uk/energy-price-cap"
                      target="_blank"
                    >
                      Ofgem Price Cap
                    </a>{" "}
                    is currently{" "}
                    <strong className="text-bold">
                      {`${priceCap[type]}p`}
                    </strong>
                    (from 1 October to 31 December 2023).
                  </Remark>
                </Comparison>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-0 flex flex-col items-end">
            <Lottie
              animationData={type === "G" ? gasIcon : electricityIcon}
              loop={2}
              aria-hidden={true}
              className="w-16 h-16"
              initialSegment={[0, 25]}
            />
            <span className="text-accentBlue-600 -mt-2 sr-only">
              {ENERGY_TYPE[type]}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex justify-center items-start flex-col">
              <Badge label="Yesterday" variant="secondary" />
              <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                {priceYesterday}
                <span className="text-sm font-sans pl-1">p</span>
              </div>
            </div>

            <div className="flex justify-center items-start flex-col">
              <Badge label="Tomorrow" variant="secondary" />
              <div className="font-digit text-center text-3xl text-white flex justify-center items-end">
                {priceTomorrowDisplay}
                {typeof priceTomorrow === "number" && (
                  <Comparison
                    change={parseInt(
                      (
                        ((priceTomorrow - priceToday) / priceToday) *
                        100
                      ).toFixed(0)
                    )}
                    compare="today"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PricePane2 = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
}) => {
  const { isLoading, isError, isSuccess, data, error } = useTariffQuery({
    tariff,
    type,
    gsp,
  });
  const results = data?.[0]?.results ?? [];
  const priceTodayIndex = results.findIndex((data) =>
    isToday(new Date(data.valid_from))
  );

  const priceYesterday = priceAccessor(results, priceTodayIndex + 1) ?? 0;
  const priceToday = priceAccessor(results, priceTodayIndex) ?? 0;
  const priceTomorrow =
    priceTodayIndex > 0 ? priceAccessor(results, priceTodayIndex - 1) : "--";
  const priceTomorrowDisplay = priceTomorrow ? (
    <>
      {priceTomorrow}
      <span className="text-sm font-sans pl-1">p</span>
    </>
  ) : (
    <>
      --
      <Remark>
        Tomorrow’s rates is usually available between 11.00am and 6.00pm
      </Remark>
    </>
  );
  return (
    <div
      className="relative flex-1 flex items-center justify-center flex-col min-h-[250px] md:min-h-[300px] rounded-xl bg-theme-950 border border-accentPink-900/50 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
      style={{
        backgroundImage: `linear-gradient(140deg, rgba(0,3,35,0.99) 30% , rgba(0,4,51,0.6) 100% ),url(${
          type === "E" ? backgroundE.src : backgroundG.src
        })`,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="absolute top-4 left-0 flex flex-col items-center justify-center px-2 ">
            <Lottie
              animationData={type === "G" ? gasIcon : electricityIcon}
              loop={2}
              aria-hidden={true}
              className="w-20 h-20"
              initialSegment={[0, 25]}
            />
            <span className="text-accentBlue-700 -mt-2">
              {ENERGY_TYPE[type]}
            </span>
          </div>
          <div className="scale-75 opacity-60 flex justify-center items-center flex-col mt-2">
            <Badge label="YESTERDAY" variant="secondary" />
            <div className="font-digit font-thin text-center text-6xl text-white flex justify-center items-center">
              {priceYesterday}
              <span className="text-sm font-sans pl-1">p</span>
            </div>
          </div>
          <div className="flex flex-1 justify-center items-center flex-col my-2 scale-110">
            <Badge label={`TODAY - ${new Date().toLocaleDateString()}`} />
            <div className="font-digit text-center text-6xl text-white flex justify-center items-center">
              <Comparison
                change={
                  priceToday !== 0
                    ? parseInt(
                        (
                          ((priceToday - priceYesterday) / priceYesterday) *
                          100
                        ).toFixed(0)
                      )
                    : null
                }
                compare="yesterday"
              />
              {priceToday}
              <span className="text-sm font-sans pl-1">p</span>
              <Comparison
                change={
                  priceToday !== 0
                    ? parseInt(
                        (
                          ((priceToday - priceCap[type]) / priceCap[type]) *
                          100
                        ).toFixed(0)
                      )
                    : null
                }
                compare="price cap"
              >
                <Remark variant="badge">
                  The{" "}
                  <a
                    href="https://www.ofgem.gov.uk/energy-price-cap"
                    target="_blank"
                  >
                    Ofgem Price Cap
                  </a>{" "}
                  is currently{" "}
                  <strong className="text-bold">
                    {type === "E" ? "27" : "7"}p
                  </strong>{" "}
                  (from 1 October to 31 December 2023).
                </Remark>
              </Comparison>
            </div>
          </div>
          <div className="scale-90 opacity-60 flex justify-center items-center flex-col mb-2">
            <Badge label="TOMORROW" variant="secondary" />
            <div className="font-digit text-center text-6xl text-white flex justify-center items-center">
              {typeof priceTomorrow === "number" && (
                <Comparison
                  change={parseInt(
                    (((priceTomorrow - priceToday) / priceToday) * 100).toFixed(
                      0
                    )
                  )}
                  compare="today"
                />
              )}
              {priceTomorrowDisplay}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export type TVariant = "default" | "badge";

const useTariffQuery = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: TariffType;
  gsp: string;
}) => {
  const queryClient = useQueryClient();
  const typeArr = type
    .split("")
    .filter((type) => type === "E" || type === "G") as ApiTariffType[];
  const query = useQuery<queryTariffResult[]>({
    queryKey: ["getTariff", tariff, type, gsp],
    queryFn: fetchApi(
      typeArr.map((type) => ({
        tariffType: type,
        url: `https://api.octopus.energy/v1/products/${tariff}/${ENERGY_TYPE[type]}-tariffs/${type}-1R-${tariff}-${gsp}/standard-unit-rates/?page_size=1500`,
      }))
    ),
  });
  return query;
};
