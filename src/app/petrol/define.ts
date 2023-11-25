"use client";

import { CSSProperties } from "react";
import { scaleOrdinal } from "d3";
import { PointFeature } from "supercluster";

export const mobileWidth = 640;
export type TStationDataSet = {
  last_updated: string;
  stations: TStationData[];
};
export interface TStationData {
  site_id: string;
  brand: string;
  address: string;
  postcode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  prices: {
    E10: number;
    E5: number;
    B7: number;
  };
}

export type TPoint = PointFeature<{
  cluster: false;
  siteID: string;
  postcode: string;
  address: string;
  prices: {
    E10: number;
    E5: number;
    B7: number;
  };
  brand: string;
}>;
export type TCluster = PointFeature<{
  cluster: true;
  point_count: number;
}>;
export type TPoints = Array<TPoint>;

const colors = [
  "#18c61a",
  "#9817ff",
  "#d31911",
  "#24b7f1",
  "#736c31",
  "#1263e2",
  "#18c199",
  "#ed990a",
  "#f2917f",
  "#7b637c",
  "#a8b311",
  "#a438c0",
  "#d00d5e",
  "#1e7b1d",
  "#05767b",
  "#aaa1f9",
  "#a5aea1",
  "#a75312",
  "#026eb8",
  "#94b665",
  "#91529e",
  "#caa74f",
  "#c90392",
  "#a84e5d",
  "#6a4cf1",
  "#1ac463",
  "#d89ab1",
  "#3c764d",
  "#2dbdc5",
  "#fb78fa",
  "#a6a9cd",
  "#c1383d",
  "#8b614e",
  "#73be38",
  "#ff8d52",
  "#cea37e",
  "#b53c7e",
  "#656d61",
  "#436f90",
  "#5e7304",
  "#82b792",
  "#fb88a3",
  "#dd8df2",
  "#6a5cc0",
  "#d098d5",
  "#ac15dc",
  "#a4543b",
  "#76b4cc",
  "#6963a4",
  "#8e620d",
  "#77adf8",
  "#c9a918",
  "#99537d",
  "#acaf7d",
  "#7850d5",
  "#ae3a9f",
  "#68bd74",
  "#e09d60",
  "#1069cd",
];
export const brands = ["Sainsbury's"];
export const colorScaleD3 = scaleOrdinal<CSSProperties["color"]>()
  .domain(brands)
  .range(colors)
  .unknown("#AAAAAA");
