"use client";
// https://www.gov.uk/government/statistics/total-final-energy-consumption-at-regional-and-local-authority-level-2005-to-2020

import Loading from "@/components/Loading";
import useEnergyDataBy, { IEnergyDataItem } from "@/hooks/useEnergyData";
import UkMap from "@/components/ukMap";
import {
  extent,
  interpolateYlOrRd,
  interpolateSpectral,
  scaleLinear,
  select,
} from "d3";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useUkMapData } from "@/hooks/useUkMapData";
import { height, width } from "../utils/constants";
import useGDPDataBy from "@/hooks/useGDPData";

const EnergyMap = () => {
  const [displayYear, setDisplayYear] = useState<number>(2019);
  const mapRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<CSSProperties["color"]>("inherit");
  const rangeRef = useRef<HTMLInputElement>(null);

  const mapData = useUkMapData();
  const data = useGDPDataBy();
  const gdpData = data?.data;

  useEffect(() => {
    if (!mapRef.current || !data || !gdpData) return;
    const colorScale = scaleLinear().domain(data.dataRange).range([0, 1]);
    const districtGroup = select(mapRef.current).select(".districtGroup");
    const tooltip = select("#tooltip");
    districtGroup
      .selectAll<SVGPathElement, any>("path")
      .transition()
      .duration(500)
      .attr("fill", function () {
        const gdp: string | undefined = gdpData.find(
          (entry) => entry["Geography code"] === this?.id
        )?.[displayYear];
        if (gdp !== undefined)
          return interpolateYlOrRd(colorScale(parseFloat(gdp)));
        return "url(#diagonalHatch)";
      });
    districtGroup
      .selectAll<SVGPathElement, any>("path")
      .on("mouseenter", function (d) {
        const thisLA = select(this);
        const element = gdpData.find(
          (entry) => entry["Geography code"] === this?.id
        );
        fillRef.current = select(this).attr("fill");
        const translateX = d.pageX > width - 200 ? d.pageX - 200 : d.pageX;
        const translateY = d.pageY > height - 200 ? d.pageY - 100 : d.pageY;
        tooltip
          .style("opacity", 1)
          .style("transform", `translate(${translateX}px,${translateY}px)`)
          .html(
            `${thisLA.attr("data-la")}${
              element?.[displayYear] ? `<br />${element?.[displayYear]}` : ""
            }`
          );
        if (!element) return;

        select(this).attr("fill", "white");
      })
      .on("mouseleave", function (e) {
        select(this).attr("fill", fillRef.current!);
        tooltip.style("opacity", 0);
      });
  }, [data, displayYear, gdpData]);

  if (!data || !mapData) return <Loading />;

  return (
    <>
      <div className="range-wrap">
        <div
          className="range-value"
          style={{
            left: `calc(${
              (displayYear - data.yearRange[0]) /
              (data.yearRange[1] - data.yearRange[0])
            } * ( 100% - 4em - 20px) + 8px)`,
          }}
        >
          <span
          /*style={{
              transform: `${
                rangeRef.current
                  ? `translate(${
                      ((parseInt(
                        getComputedStyle(rangeRef.current).getPropertyValue(
                          "width"
                        )
                      ) -
                        20) /
                        (data.yearRange[1] - data.yearRange[0])) *
                        (displayYear - data.yearRange[0]) -
                      5
                    }px,0)`
                  : 0
              }`,
            }}*/
          >
            {displayYear}
          </span>
        </div>
        <label className="sr-only">Year:</label>
        <input
          ref={rangeRef}
          type="range"
          id="range"
          min={data.yearRange[0]}
          max={data.yearRange[1]}
          step={1}
          value={displayYear}
          onChange={(e) => setDisplayYear(parseInt(e.target.value))}
        />
      </div>

      <div
        id="tooltip"
        style={{
          color: "white",
          position: "absolute",
          backgroundColor: "#00000099",
          padding: "1em",
          borderRadius: "1.5em",
          transition: "all 300ms ease-out",
          opacity: 0,
          pointerEvents: "none",
        }}
      ></div>

      <UkMap mapData={mapData} mapRef={mapRef} baseColor="blue" />
    </>
  );
};

export default EnergyMap;
