import { useEffect, useRef } from "react";

import Loading from "../Loading";

import { useUkGspMapData } from "@/hooks/useUkGspMap";

import {
  ENERGY_TYPE,
  QuerySingleTariffPlanResult,
  Single_tariff_gsp_record,
  TRACKER,
  gsp,
} from "@/data/source";
import {
  geoIdentity,
  geoPath,
  select,
  path,
  scaleSequential,
  interpolate,
  extent,
} from "d3";
import useTariffQuery from "@/hooks/useTariffQuery";
import { evenRound } from "@/utils/helpers";
import ErrorMessage from "./ErrorMessage";
import { EnergyIcon } from "./EnergyIcon";

interface IMapChart {
  tariff: string;
  type: keyof typeof ENERGY_TYPE;
  gsp: string;
}

const MapChart = ({ tariff, type, gsp }: IMapChart) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const mapData = useUkGspMapData();
  const width = 320;
  const height = 500;

  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QuerySingleTariffPlanResult>({
      tariff,
      type,
    });

  let path = geoPath();
  if (mapData?.districts) {
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([width, height], mapData?.districts ?? null);
    path = geoPath(projection);
  }

  useEffect(() => {
    if (!svgRef.current || !mapData || !mapData?.districts || !data) return;
    const svg = select(svgRef.current);
    const tariffTypeKey =
      `single_register_${ENERGY_TYPE[type]}_tariffs` as keyof QuerySingleTariffPlanResult;
    const singleTariffByGsp = data[0]?.[tariffTypeKey] ?? [];

    const allValues = Object.values(
      singleTariffByGsp
    ) as Single_tariff_gsp_record[];
    let valueExtent = extent(
      allValues,
      (d) => d["direct_debit_monthly"]["standard_unit_rate_inc_vat"]
    );
    if (!valueExtent[0] && !valueExtent[1]) {
      valueExtent = [0, TRACKER[0].cap.E];
    }
    const colorScale = scaleSequential(
      interpolate("#FFFFFF", "#ce2cb9")
    ).domain(valueExtent);

    svg
      .select(".figures")
      .selectAll("text")
      .data(mapData.districts.features)
      .join("text")
      .text(
        (d) =>
          `${
            evenRound(
              singleTariffByGsp[d?.properties?.Name as gsp]?.[
                "direct_debit_monthly"
              ]?.["standard_unit_rate_inc_vat"],
              2
            ) + "p" ?? "--"
          }`
      )
      .attr("transform", (d) => {
        const coords = path.centroid(d.geometry);
        return `translate(${coords[0]} ${coords[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("fill", (d) => {
        const value =
          evenRound(
            singleTariffByGsp[d?.properties?.Name as gsp]?.[
              "direct_debit_monthly"
            ]?.["standard_unit_rate_inc_vat"],
            2
          ) ?? 100;
        return colorScale(value);
      })
      .attr("font-size", "14")
      .attr("font-weight", "bold");
  }, [mapData, data, type, path]);

  return (
    <div className="chartDiv relative w-full h-[450px] flex-1 flex items-center justify-center flex-col rounded-xl bg-theme-950 border border-accentPink-700/50 shadow-inner overflow-hidden">
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
          >
            <g>
              <g className="zoomGroup">
                <g className="districtGroup">
                  {mapData.districts.features.map((feature, i) => (
                    <path
                      key={i}
                      d={path(feature.geometry) ?? undefined}
                      fill="#03155e"
                    />
                  ))}
                </g>
                <path
                  fill="none"
                  stroke="#010422"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  d={path(mapData.interiors) ?? undefined}
                />
              </g>
              <g className="figures"></g>
            </g>
          </svg>
          <p className="text-xs text-accentBlue-800 self-end">
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
