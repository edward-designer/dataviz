"use client";

import Loading from "@/components/Loading";
import Globe from "@/components/Globe";
import { useMap } from "@/hooks/useMap";
import type { Feature } from "geojson";
import { useRef, useState } from "react";

const WorldMap = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = globalThis.innerWidth;
  const height = globalThis.innerHeight;
  const [selectedCountry, setSelectedCountry] = useState<Feature | null>(null);

  const data = useMap();

  if (!data) return <Loading />;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      ref={svgRef}
    >
      <Globe
        data={data}
        width={width}
        height={height}
        setSelectedCountry={setSelectedCountry}
        selectedCountry={selectedCountry}
        svgRef={svgRef}
      />
    </svg>
  );
};

export default WorldMap;
