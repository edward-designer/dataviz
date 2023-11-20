"use client";
/* steps to obtain topojson
    1. go to https://geoportal.statistics.gov.uk/ to search and download geojson (note the coordinates are pre-projected)
        search term: local authority, content type: Feature Layer OR
        in the menu: Boundaries -> Admin Boundaries -> Local Authority Districts -> BUC is generally enough
    2. to to https://mapshaper.org/ to simplify, remove intersections and convert to topojson
*/

import Loading from "@/components/Loading";
import { IUkMapData } from "@/hooks/useUkMapData";
import { memo, useEffect, RefObject, CSSProperties } from "react";
import {
  geoPath,
  geoMercator,
  geoNaturalEarth1,
  geoIdentity,
  zoom,
  select,
  D3ZoomEvent,
  easeCubicOut,
  easeCubicInOut,
} from "d3";
import { width, height } from "@/utils/constants";

interface TUkMap {
  mapData: IUkMapData;
  mapRef: RefObject<SVGSVGElement>;
  baseColor: CSSProperties["color"];
}

const UkMap = ({ mapData, mapRef, baseColor = "red" }: TUkMap) => {
  useEffect(() => {
    if (!mapData) return;
    const handleZoom = (event: D3ZoomEvent<SVGSVGElement, undefined>) => {
      select(mapRef.current)
        .select(".zoomGroup")
        .transition()
        .ease(easeCubicOut)
        .delay(0)
        .duration(500)
        .attr("transform", event.transform.toString());
    };
    select<SVGSVGElement, unknown>("svg").call(
      zoom<SVGSVGElement, unknown>()
        .scaleExtent([-0.5, 12])
        .translateExtent([
          [-1000, -1000],
          [width + 1000, height + 1000],
        ])
        .on("zoom", handleZoom)
    );
  }, [mapData, mapRef]);

  if (!mapData) return <Loading />;

  const projection = geoIdentity()
    .reflectY(true)
    .fitSize([width + 500, height], mapData?.districts);
  const pathGenerator = geoPath(projection);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      ref={mapRef}
    >
      <pattern
        id="diagonalHatch"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45 0 0)"
        width="4"
        height="4"
      >
        <rect width="4" height="4" fill="rgb(150,150,150)" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="4"
          style={{ stroke: "rgb(120,120,120)", strokeWidth: 2 }}
        />
      </pattern>
      <g className="zoomGroup">
        <g className="districtGroup">
          {mapData.districts.features.map((feature) => (
            <path
              key={feature.id}
              d={pathGenerator(feature.geometry) ?? undefined}
              id={feature?.properties?.LAD13CD || feature?.properties?.LAD21CD}
              fill={baseColor}
              data-la={
                feature?.properties?.LAD13NM || feature?.properties?.LAD21NM
              }
            />
          ))}
        </g>
        <path
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
          d={pathGenerator(mapData.interiors) ?? undefined}
        />
      </g>
    </svg>
  );
};

export default memo(UkMap);
