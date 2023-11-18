import { useState, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
import { GeometryObject, Topology } from "topojson-specification";
import { FeatureCollection, GeoJsonProperties } from "geojson";

const jsonPath = "../lad_2021May.json";

export interface IUkMapData {
  districts: FeatureCollection;
  interiors: ReturnType<typeof mesh>;
  transform: {
    scale: [number, number];
    translate: [number, number];
  };
}

export const useUkMapData = () => {
  const [data, setData] = useState<IUkMapData | null>(null);
  useEffect(() => {
    try {
      json<Topology>(jsonPath).then((topology) => {
        if (topology) {
          const lad = topology.objects.lad as GeometryObject;
          setData({
            districts: feature(topology, lad) as FeatureCollection,
            interiors: mesh(topology, lad),
            transform: topology.transform!,
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return data;
};
