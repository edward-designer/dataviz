import { useContext, useEffect, useRef, useState } from "react";

import Loading from "../Loading";

import { IUkMapData, useUkGspMapData } from "@/hooks/useUkGspMap";

import {
  ENERGY_TYPE,
  ENERGY_TYPE_ICON,
  QuerySingleAgileGSPResult,
  Single_tariff_gsp_record,
  Single_tariff_gsp_record_charge_type,
  gsp,
} from "@/data/source";
import { addSign, calculateChangePercentage, evenRound } from "@/utils/helpers";
import {
  axisRight,
  extent,
  geoIdentity,
  geoPath,
  interpolate,
  pointer,
  scalePoint,
  scaleSequential,
  select,
  selectAll,
  zoom,
  zoomIdentity,
  zoomTransform,
} from "d3";

import useAgileTariffQuery from "@/hooks/useAgileTariffQuery";
import { EnergyIcon } from "./EnergyIcon";
import ErrorMessage from "./ErrorMessage";
import usePriceCapQuery from "@/hooks/usePriceCapQuery";
import { HiVizContext } from "@/context/hiViz";

interface IMapChartAgile {
  tariff: string;
  type: keyof typeof ENERGY_TYPE;
  rate?: Single_tariff_gsp_record_charge_type;
  gsp: string;
  currentPeriod: string;
}

const MapChartAgile = ({
  tariff,
  type,
  rate = "standard_unit_rate_inc_vat",
  gsp,
  currentPeriod,
}: IMapChartAgile) => {
  const { hiViz } = useContext(HiVizContext);

  const svgRef = useRef<SVGSVGElement>(null);
  const mapData = useUkGspMapData();
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);

  let width = 320;
  let height = 480;

  if (typeof document !== "undefined") {
    width =
      document.querySelector(".pricePane")?.getBoundingClientRect().width ??
      width;
  }

  const { isLoading, isError, isSuccess, refetch, data, error } =
    useAgileTariffQuery<QuerySingleAgileGSPResult>({
      tariff,
    });

  let path = geoPath();
  if (mapData?.districts) {
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([width, height], mapData?.districts ?? null);
    path = geoPath(projection);
  }

  const caps = usePriceCapQuery({});

  useEffect(() => setSelectedPeriod(currentPeriod), [currentPeriod]);

  useEffect(() => {
    if (!svgRef.current || !mapData || !mapData?.districts || !data) return;
    let scale = 1;
    const svg = select(svgRef.current);
    const tooltip = svg.select(".tooltipContainer");
    const defs = svg.append("defs");
    const dataAgile = data.map((gspData) => ({
      gsp: gspData.gsp,
      result: gspData.results.find((result) => {
        return (
          new Date(result.valid_from) <= new Date(currentPeriod) &&
          new Date(result.valid_to) >= new Date(currentPeriod)
        );
      }),
    }));

    const getCapsRegionData = (gsp: string) =>
      caps.data
        ?.filter((row) => row.Region === `_${gsp}`)
        .sort(
          (a, b) => new Date(b.Date).valueOf() - new Date(a.Date).valueOf()
        ) ?? [];
    const getCapsCurrentRegionData = (gsp: string) =>
      getCapsRegionData(gsp).find((d) => new Date(d.Date) <= new Date())!;

    if (
      rate === "standard_unit_rate_inc_vat" &&
      dataAgile[0].result?.valid_from &&
      dataAgile[0].result?.valid_from
    ) {
      const updateDate = `${new Date(
        dataAgile[0].result.valid_from
      ).toLocaleDateString("en-GB")} ${new Date(
        dataAgile[0].result.valid_from
      ).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(dataAgile[0].result.valid_to).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`;
      svg.select(".info").text(updateDate);
    }

    let valueExtent = extent(dataAgile, (d) => d.result?.value_inc_vat);
    if (!valueExtent[0] && !valueExtent[1]) {
      valueExtent = [0, 100];
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

    const getPrice = (gsp: gsp, data: typeof dataAgile) =>
      evenRound(
        data.find((d) => d.gsp === gsp)?.result?.value_inc_vat ?? 0,
        2,
        true
      ) + "p" ?? "--";
    const getPriceValue = (gsp: gsp, data: typeof dataAgile) =>
      evenRound(data.find((d) => d.gsp === gsp)?.result?.value_inc_vat ?? 0, 2);
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
          rate === "standard_unit_rate_inc_vat"
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
          .text(`${ENERGY_TYPE_ICON[type]} ${getPrice(gsp, dataAgile)}`);
        tooltip
          .select(".zoneCompareT1")
          .text(
            `🆚 ${addSign(
              Number(
                calculateChangePercentage(
                  parseFloat(getPrice(gsp, dataAgile)),
                  capToCompare
                )
              )
            )}%`
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
        .text((d) => getPrice(d?.properties?.Name, dataAgile))
        .attr("transform", (d) => {
          const coords = path.centroid(d.geometry);
          return `translate(${coords[0]} ${coords[1]})`;
        })
        .attr("text-anchor", "middle")
        .attr("fill", (d) => {
          const value = getPriceValue(d?.properties?.Name, dataAgile);
          return colorScale(value);
        })
        .attr("font-weight", "bold")
        .style("pointer-events", "none");
    }
    updatePrice(mapData);

    var zoomBehavior = zoom<SVGSVGElement, unknown>()
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
    currentPeriod,
    caps.data,
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

export default MapChartAgile;
