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
import { useUkMapData } from "@/hooks/useUkMapData2019";
import { height, width } from "../../utils/constants";

const EnergyMap = () => {
  const [displayYear, setDisplayYear] = useState<number>(2020);
  const [type, setType] = useState<keyof IEnergyDataItem>("All_fuels_Domestic");
  const mapRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<CSSProperties["color"]>("inherit");
  const rangeRef = useRef<HTMLInputElement>(null);

  const mapData = useUkMapData();
  const data = useEnergyDataBy("Year", type);
  const dataDisplayYear = data?.data?.get(displayYear.toString());

  useEffect(() => {
    if (!mapRef.current || !data) return;
    if (!dataDisplayYear) return;
    const colorScale = scaleLinear().domain(data.dataRange).range([0, 1]);
    const districtGroup = select(mapRef.current).select(".districtGroup");
    const tooltip = select("#tooltip");
    districtGroup
      .selectAll<SVGPathElement, any>("path")
      .attr("fill", function () {
        const fuelUse: string | undefined = dataDisplayYear.find(
          (entry) => entry.Code === this?.id
        )?.[type];
        if (fuelUse !== undefined)
          return interpolateYlOrRd(colorScale(parseFloat(fuelUse)));
        return "url(#diagonalHatch)";
      });
    districtGroup
      .selectAll<SVGPathElement, any>("path")
      .on("mouseenter", function (d) {
        const thisLA = select(this);
        const element = dataDisplayYear.find(
          (entry) => entry.Code === thisLA.attr("id")
        );
        fillRef.current = select(this).attr("fill");
        const translateX = d.pageX > width - 200 ? d.pageX - 200 : d.pageX;
        const translateY = d.pageY > height - 200 ? d.pageY - 100 : d.pageY;
        tooltip
          .style("opacity", 1)
          .style("transform", `translate(${translateX}px,${translateY}px)`)
          .html(
            `${thisLA.attr("data-la")}${
              element?.[type] ? `<br />${element?.[type]} ktoe` : ""
            }`
          );
        if (!element) return;

        select(this).attr("fill", "white");
      })
      .on("mouseleave", function (e) {
        select(this).attr("fill", fillRef.current!);
        tooltip.style("opacity", 0);
      });
  }, [data, dataDisplayYear, displayYear, type]);

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
          <span>{displayYear}</span>
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
