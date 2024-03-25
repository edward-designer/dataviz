import { useContext, useEffect, useRef } from "react";

import Loading from "../Loading";

import { IUkMapData, useUkGspMapData } from "@/hooks/useUkGspMap";

import {
  ENERGY_TYPE,
  ENERGY_TYPE_ICON,
  QuerySingleTariffPlanResult,
  Single_tariff,
  Single_tariff_gsp_record,
  Single_tariff_gsp_record_charge_type,
  TRACKER,
  gsp,
} from "@/data/source";
import useTariffQuery from "@/hooks/useTariffQuery";
import { addSign, calculateChangePercentage, evenRound } from "@/utils/helpers";
import {
  axisRight,
  extent,
  geoIdentity,
  geoPath,
  interpolate,
  pointer,
  scaleLinear,
  scalePoint,
  scaleSequential,
  select,
  selectAll,
  zoom,
  zoomIdentity,
  zoomTransform,
} from "d3";

import { EnergyIcon } from "./EnergyIcon";
import ErrorMessage from "./ErrorMessage";
import usePriceCapQuery from "@/hooks/usePriceCapQuery";
import { HiVizContext } from "@/context/hiViz";

interface IMapChart {
  tariff: string;
  type: keyof typeof ENERGY_TYPE;
  rate?: Single_tariff_gsp_record_charge_type;
  gsp: string;
  dual?: boolean;
}

const MapChart = ({
  tariff,
  type,
  rate = "standard_unit_rate_inc_vat",
  gsp,
  dual = false,
}: IMapChart) => {
  const { hiViz } = useContext(HiVizContext);

  const svgRef = useRef<SVGSVGElement>(null);
  const mapData = useUkGspMapData();

  let width = 320;
  let height = 480;

  if (typeof document !== "undefined") {
    width =
      document.querySelector(".mapDiv")?.getBoundingClientRect().width ?? width;
  }

  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QuerySingleTariffPlanResult>({
      tariff,
      type,
      dual,
    });
  console.log(data);
  const caps = usePriceCapQuery({});

  let path = geoPath();
  if (mapData?.districts) {
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([width, height], mapData?.districts ?? null);
    path = geoPath(projection);
  }

  useEffect(() => {
    if (
      !svgRef.current ||
      !mapData ||
      !mapData?.districts ||
      !data ||
      !caps.data ||
      isLoading
    )
      return;

    let scale = 1;
    const svg = select(svgRef.current);
    const tooltip = svg.select(".tooltipContainer");
    const defs = svg.append("defs");

    const getCapsRegionData = (gsp: string) =>
      caps.data
        ?.filter((row) => row.Region === `_${gsp}`)
        .sort(
          (a, b) => new Date(b.Date).valueOf() - new Date(a.Date).valueOf()
        ) ?? [];
    const getCapsCurrentRegionData = (gsp: string) =>
      getCapsRegionData(gsp).find((d) => new Date(d.Date) <= new Date())!;

    if (rate === "standard_unit_rate_inc_vat") {
      const validDate = new Date(
        data[0].tariffs_active_at as string
      ).toLocaleDateString("en-GB");
      const updateDate =
        validDate === new Date().toLocaleDateString("en-GB")
          ? `Today (${validDate})`
          : validDate ===
            new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toLocaleDateString("en-GB")
          ? `Yesterday (${validDate})`
          : `Updated at ${validDate}`;
      svg.select(".info").text(updateDate);
    }
    if (rate === "day_unit_rate_inc_vat") {
      const validDate = new Date(
        data[0].tariffs_active_at as string
      ).toLocaleDateString("en-GB");
      const updateDate =
        validDate === new Date().toLocaleDateString("en-GB")
          ? `Today (${validDate}) Peak Rate`
          : validDate ===
            new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toLocaleDateString("en-GB")
          ? `Yesterday (${validDate}) Peak Rate`
          : `Updated at ${validDate}`;
      svg.select(".info").text(updateDate);
    }
    if (rate === "night_unit_rate_inc_vat") {
      const validDate = new Date(
        data[0].tariffs_active_at as string
      ).toLocaleDateString("en-GB");
      const updateDate =
        validDate === new Date().toLocaleDateString("en-GB")
          ? `Today (${validDate}) Off-Peak Rate`
          : validDate ===
            new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toLocaleDateString("en-GB")
          ? `Yesterday (${validDate}) Off-Peak Rate`
          : `Updated at ${validDate}`;
      svg.select(".info").text(updateDate);
    }
    if (rate === "standing_charge_inc_vat") {
      const ofgemCap = `Your SVT Cap: ${
        getCapsCurrentRegionData(gsp)[`${type}S`]
      }p`;
      svg.select(".info").text(ofgemCap);
    }

    const tariffTypeKey = dual
      ? (`dual_register_${ENERGY_TYPE[type]}_tariffs` as keyof QuerySingleTariffPlanResult)
      : (`single_register_${ENERGY_TYPE[type]}_tariffs` as keyof QuerySingleTariffPlanResult);
    const singleTariffByGsp = (data[0]?.[tariffTypeKey] ?? []) as Single_tariff;
    const allValues = Object.values(
      singleTariffByGsp
    ) as Single_tariff_gsp_record[];
    let valueExtent = extent(allValues, (d) => {
      if (
        "direct_debit_monthly" in d &&
        rate !== "day_unit_rate_inc_vat" &&
        rate !== "night_unit_rate_inc_vat"
      )
        return d["direct_debit_monthly"][rate];
      if ("varying" in d) return d["varying"][rate];
      else [0, 0];
    });
    if (!valueExtent[0] && !valueExtent[1]) {
      valueExtent = [0, TRACKER[0].cap.E];
    }
    const colorScale = scaleSequential(
      interpolate("#FFFFFF", hiViz ? "#FFFFFF" : "#ce2cb9")
    ).domain(valueExtent);

    const valueExtentasPoint = valueExtent.map((value) =>
      evenRound(value, 2, true)
    );
    const legendScale = scalePoint()
      .domain(valueExtentasPoint)
      .range([height / 2, 0]);
    const legendAxis = axisRight(legendScale)
      .tickSize(10)
      .ticks(2)
      .tickFormat((d, i) => `${d}p`);

    const legendGradient = defs
      .append("linearGradient")
      .attr("id", "legendGradient");
    legendGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    legendGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ce2cb9");
    legendGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FFFFFF");
    svg
      .select<SVGGElement>(".legend")
      .append("rect")
      .attr("width", 10)
      .attr("height", height / 2)
      .style("fill", "url(#legendGradient)");
    const legendAxisRender = svg
      .select<SVGGElement>(".legend")
      .attr("transform", `translate(10,${height / 2 - 20})`)
      .call(legendAxis);
    legendAxisRender
      .style("color", "#00000080")
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "#FFFFFF80");

    const getPrice = (gsp: gsp) => {
      const tariffDetails = singleTariffByGsp[gsp];
      if (tariffDetails) {
        let key = "";
        if (
          "direct_debit_monthly" in tariffDetails &&
          rate !== "day_unit_rate_inc_vat" &&
          rate !== "night_unit_rate_inc_vat"
        )
          return tariffDetails["direct_debit_monthly"][rate] === null
            ? "--"
            : evenRound(tariffDetails["direct_debit_monthly"][rate], 2) + "p";
        if ("varying" in tariffDetails)
          return tariffDetails["varying"][rate] === null
            ? "--"
            : evenRound(tariffDetails["varying"][rate], 2) + "p";
        return;
      }
      return;
    };
    svg
      .select(".districtGroup")
      .selectAll("path")
      .data(mapData.districts.features)
      .join("path")
      .attr("d", (d) => path(d.geometry) ?? null)
      .attr("fill", (d) =>
        d.properties?.Name === `_${gsp}`
          ? hiViz
            ? "#3a63ba"
            : "#13357e"
          : hiViz
          ? "#00187a"
          : "#03155e"
      )
      .attr("data-zone", (d) => d.properties?.Name)
      .attr("data-zoneName", (d) => d.properties?.LongName)
      .on("pointerenter pointermove", function (e) {
        select(this).attr("fill", hiViz ? "#1b1d29" : "#092287");
        const coordinates = pointer(e);
        const gsp = select(this).attr("data-zone") as gsp;
        const capToCompare =
          rate === "standard_unit_rate_inc_vat" ||
          rate === "day_unit_rate_inc_vat" ||
          rate === "night_unit_rate_inc_vat"
            ? parseFloat(getCapsCurrentRegionData(gsp.replace("_", ""))[type])
            : parseFloat(
                getCapsCurrentRegionData(gsp.replace("_", ""))[`${type}S`]
              );
        // Tooltip position
        const tooltipPosition = svgRef.current
          ?.querySelector(".tooltip")
          ?.getBoundingClientRect();
        const tooltipShiftLeft =
          (svgRef.current?.getBoundingClientRect()?.right ?? Infinity) <
          e.clientX + (tooltipPosition?.width ?? 200)
            ? -(tooltipPosition?.width ?? 0) - 20
            : 0;
        const tooltipShiftUp =
          (svgRef.current?.getBoundingClientRect()?.bottom ?? Infinity) <
          e.clientY + (tooltipPosition?.height ?? 200)
            ? -(tooltipPosition?.height ?? 0) - 20
            : 0;
        tooltip
          .attr("opacity", "1")
          .transition()
          .duration(20)
          .attr("transform", `translate(${coordinates[0]},${coordinates[1]})`);
        tooltip
          .select(".tooltipTranslate")
          .attr(
            "transform",
            `translate(${tooltipShiftLeft},${tooltipShiftUp})`
          );
        tooltip
          .select(".zone")
          .text(select(this).attr("data-zone").replace("_", ""));
        tooltip.select(".zoneName").text(select(this).attr("data-zoneName"));
        tooltip
          .select(".zonePrice")
          .text(`${ENERGY_TYPE_ICON[type]} ${getPrice(gsp)}`);
        tooltip
          .select(".zoneCompareT1")
          .text(
            `🆚 ${
              getPrice(gsp) === "--"
                ? "--"
                : addSign(
                    Number(
                      calculateChangePercentage(
                        parseFloat(getPrice(gsp) ?? "--"),
                        capToCompare
                      )
                    )
                  )
            }%`
          );
      })
      .on("pointerleave", function (d) {
        select(this).attr(
          "fill",
          select(this).attr("data-zone") === `_${gsp}`
            ? hiViz
              ? "#3a63ba"
              : "#13357e"
            : hiViz
            ? "#00187a"
            : "#03155e"
        );
      })
      .on("pointerleave.zoom", null);

    svg.on("mouseleave", function () {
      tooltip.attr("opacity", "0");
    });

    function updatePrice(mapData: IUkMapData) {
      svg
        .select(".figures")
        .selectAll("text")
        .data(mapData.districts.features)
        .join("text")
        .text((d) => getPrice(d?.properties?.Name) ?? "--")
        .attr("transform", (d) => {
          const coords = path.centroid(d.geometry);
          return `translate(${coords[0]} ${coords[1]})`;
        })
        .attr("text-anchor", "middle")
        .attr("fill", (d) => {
          const tariffDetails = singleTariffByGsp[d?.properties?.Name as gsp];
          let value = 100;
          if (tariffDetails) {
            let key = "";
            if (
              "direct_debit_monthly" in tariffDetails &&
              rate !== "day_unit_rate_inc_vat" &&
              rate !== "night_unit_rate_inc_vat"
            )
              value = evenRound(
                singleTariffByGsp[d?.properties?.Name as gsp]?.[
                  "direct_debit_monthly"
                ]?.[rate],
                2
              );
            if ("varying" in tariffDetails)
              value = evenRound(
                singleTariffByGsp[d?.properties?.Name as gsp]?.["varying"]?.[
                  rate
                ],
                2
              );
          }
          return colorScale(value);
        })
        .attr("font-weight", "bold")
        .style("pointer-events", "none");
    }
    updatePrice(mapData);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 4])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", function (event) {
        scale = event.transform.k;
        selectAll(".zoomGroup").attr("transform", event.transform);
        selectAll(".figures")
          .selectAll("text")
          .attr("font-size", 14 / event.transform.k);
        tooltip.attr("opacity", "0");
        selectAll(".tooltip").attr(
          "transform",
          `translate(${10 / scale} ${10 / scale}) scale(${1 / scale})`
        );

        // synchronize zoom level of all maps
        const thisMap = this;
        if (event.sourceEvent?.target) {
          selectAll<SVGSVGElement, unknown>(".mapChartSvg")
            .filter(function () {
              return this !== thisMap;
            })
            .call(zoomBehavior.transform, event.transform);
        }
      });

    svg.call(zoomBehavior);

    // set zoom to original state at beginning and re-render
    svg
      .transition()
      .duration(500)
      .call(
        zoomBehavior.transform,
        zoomIdentity,
        zoomTransform(svg.node()!).invert([width / 2, height / 2])
      );
  }, [
    mapData,
    data,
    type,
    path,
    height,
    gsp,
    rate,
    width,
    caps.data,
    isLoading,
    hiViz,
    dual,
  ]);

  return (
    <div className="mapDiv relative h-[450px] flex-1 flex items-center justify-center flex-col rounded-xl bg-black/30 border border-accentPink-950 shadow-inner overflow-hidden">
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess && mapData && (
        <>
          <EnergyIcon type={type} />
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            ref={svgRef}
            className="mapChartSvg"
          >
            <g>
              <g className="zoomGroup">
                <g className="districtGroup"></g>
                <path
                  fill="none"
                  stroke="#010422"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  d={path(mapData.interiors) ?? undefined}
                />
                <g className="figures"></g>
                <g
                  className="tooltipContainer"
                  opacity="0"
                  pointerEvents="none"
                >
                  <g className="tooltip" transform="translate(10 10)">
                    <g className="tooltipTranslate">
                      <rect width="150" height="116" fill="#000000CC" />
                      <text
                        className="zone text-2xl font-bold fill-accentPink-500"
                        x="10"
                        y="30"
                      ></text>
                      <text
                        className="zoneName text-xs fill-white/60"
                        x="10"
                        y="44"
                      ></text>
                      <text
                        className="zonePrice fill-white"
                        x="10"
                        y="70"
                      ></text>
                      <text className="zoneCompare fill-white" x="10" y="90">
                        <tspan className="zoneCompareT1"></tspan>
                        <tspan dy="14" className="zoneCompareT2" fontSize="8">
                          *vs SVT cap
                        </tspan>
                      </text>
                    </g>
                  </g>
                </g>
              </g>
              {!hiViz && <g className="legend"></g>}
              <text
                className="info font-display font-bold fill-white/60 text-lg"
                x="10"
                y="30"
              />
            </g>
          </svg>
          <p className="absolute text-xs text-accentBlue-800 right-1 bottom-1">
            [map source:{" "}
            <a href="https://opennetzero.org/dataset/gis-boundaries-for-gb-dno-license-areas">
              National Grid ESO
            </a>
            ]
          </p>
        </>
      )}
    </div>
  );
};

export default MapChart;
