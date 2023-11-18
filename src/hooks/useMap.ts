import { useState, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
import { GeometryObject, Topology } from "topojson-specification";
import { FeatureCollection, GeoJsonProperties } from "geojson";

const jsonUrl = "/api/world-atlas";

export interface IMapData {
  countries: FeatureCollection;
  interiors: ReturnType<typeof mesh>;
}

export const useMap = () => {
  const [data, setData] = useState<IMapData | null>(null);

  useEffect(() => {
    try {
      json<Topology>(jsonUrl).then((topology) => {
        if (topology && topology?.objects?.countries) {
          const countries = topology.objects.countries as GeometryObject;
          setData({
            countries: feature(topology, countries) as FeatureCollection,
            interiors: mesh(topology, countries, (a, b) => a !== b),
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return data;
};
