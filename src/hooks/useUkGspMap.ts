import { useState, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
import { GeometryObject, Topology } from "topojson-specification";
import { FeatureCollection, GeoJsonProperties } from "geojson";

const jsonPath = "/gsp.json";

export interface IUkMapData {
  districts: FeatureCollection;
  interiors: ReturnType<typeof mesh>;
}

export const useUkGspMapData = () => {
  const [data, setData] = useState<IUkMapData | null>(null);

  useEffect(() => {
    try {
      json<Topology>(jsonPath).then((topology) => {
        if (topology) {
          const gsp = topology.objects.gsp as GeometryObject;
          setData({
            districts: feature(topology, gsp) as FeatureCollection,
            interiors: mesh(topology, gsp, (a, b) => a !== b),
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return data;
};
