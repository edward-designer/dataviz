import { useState, useEffect } from "react";
import { json } from "d3";
import { feature, mesh } from "topojson-client";
import { GeometryObject, Topology } from "topojson-specification";
import { FeatureCollection, GeoJsonProperties } from "geojson";

//https://www.data.gov.uk/dataset/4b8d3173-9040-4523-9bbf-1cdc75c1346d/counties-and-unitary-authorities-may-2021-uk-bfc
const jsonPath = "../topo_uk.json";

export interface IUkMapData {
  districts: FeatureCollection;
  interiors: ReturnType<typeof mesh>;
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
            interiors: mesh(topology, lad, (a, b) => a !== b),
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return data;
};
