"use client";
/*import { useEffect, useRef, useState } from "react";

//import { MapContainer, TileLayer } from "react-leaflet";
import { Map } from "leaflet";
import { csv } from "d3";
import { BBox } from "geojson";

import { MinimapControl } from "../../components/leafletMap/MiniMap";
import { Markers } from "../../components/leafletMap/Markers";
import Legend from "@/components/leafletMap/Legend";
import Title from "@/components/leafletMap/Title";

import { IoMdLocate } from "react-icons/io";

import {
  TPoints,
  TPoint,
  TChargePointData,
  colorScaleD3,
  brands,
} from "./define";

import "leaflet/dist/leaflet.css";
import useLocationMarker from "@/components/leafletMap/useLocationMarker";

import dynamic from "next/dynamic";

// Dynamic import of react-leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  {
    ssr: false, // Disable server-side rendering for this component
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  {
    ssr: false,
  }
);
const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  {
    ssr: false,
  }
);
const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  {
    ssr: false,
  }
);

const ChargePointMap = () => {
  const [chargePointData, setChargePointData] = useState<TPoints>([]);
  const [bounds, setBounds] = useState<BBox | undefined>();
  const [zoom, setZoom] = useState(6);
  const mapRef = useRef<Map | null>(null);
  const { LocationMarker, handleFindMe } = useLocationMarker(mapRef);

  useEffect(() => {
    const filterData = (data: TChargePointData) =>
      data.chargeDeviceStatus !== "Planned";
    const transformData = (data: TChargePointData): TPoint => {
      return {
        type: "Feature",
        properties: {
          cluster: false,
          name: data.name,
          chargeDeviceID: data.chargeDeviceID,
          reference: data.reference,
          postcode: data.postcode,
          chargeDeviceStatus: data.chargeDeviceStatus,
          deviceControllerName: data.deviceControllerName,
        },
        geometry: {
          type: "Point",
          coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
        },
      };
    };

    const getChargePointData = async () => {
      const csvData = (await csv(
        "https://gist.githubusercontent.com/edward-designer/d19a0fbc001d19543aa4c2d20cb869b6/raw/b19d0fac26472021b49ba0471e2ff08cb6321546/gistfile1.txt"
      )) as TChargePointData[];
      const points = csvData.filter(filterData).map(transformData);
      setChargePointData(points);
    };
    getChargePointData();
  }, []);

  useEffect(() => {
    const updateMapInfoForCluster = () => {
      if (!mapRef.current) return;
      const b = mapRef.current.getBounds();
      setBounds([
        b.getSouthWest().lng,
        b.getSouthWest().lat,
        b.getNorthEast().lng,
        b.getNorthEast().lat,
      ]);
      setZoom(mapRef.current.getZoom());
    };
    updateMapInfoForCluster();
    mapRef.current?.on("zoom move", updateMapInfoForCluster);
  }, [chargePointData]);

  return (
    <>
      <MapContainer
        center={[55.7, 0]}
        zoom={zoom}
        minZoom={3}
        maxZoom={17}
        scrollWheelZoom={true}
        className="h-[100dvh]"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Markers
          mapRef={mapRef}
          data={chargePointData}
          bounds={bounds}
          zoom={zoom}
        />
        <MinimapControl position="topright" />
        <LocationMarker />
      </MapContainer>
      <Title
        title="UK EV Chargepoint Map"
        source="https://www.gov.uk/guidance/find-and-use-data-on-public-electric-vehicle-chargepoints"
      />
      <button
        type="button"
        className="absolute top-20 left-3 z-50 w-8 h-8 bg-white border-2 border-gray-400 text-center shadow-md rounded-sm flex justify-center items-center"
        onClick={handleFindMe}
        aria-label="Find My Location"
      >
        <IoMdLocate />
      </button>
      <Legend
        categories={brands}
        colorScale={colorScaleD3}
        others={{ name: "Others", color: "#AAAAAA" }}
      />
    </>
  );
};

export default ChargePointMap;
*/

const page = () => {
  return <div></div>;
};

export default page;
