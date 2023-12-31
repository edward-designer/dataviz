"use client";
import { MutableRefObject } from "react";
import { Marker, Popup, CircleMarker } from "react-leaflet";
import L, { Map } from "leaflet";
import useSupercluster from "use-supercluster";
import { extent, scaleLog } from "d3";
import { BBox } from "geojson";
import { TPoints, TCluster, colorScaleD3 } from "../../app/chargePoint/define";

export const Markers = ({
  mapRef,
  data,
  bounds,
  zoom,
}: {
  mapRef: MutableRefObject<Map | null>;
  data: TPoints;
  bounds: BBox | undefined;
  zoom: number;
}) => {
  const { clusters, supercluster } = useSupercluster({
    points: data,
    bounds,
    zoom,
    options: { radius: 700 / zoom, maxZoom: 12 },
  });

  const domain = extent(
    clusters.filter((point) => point.properties.cluster) as TCluster[],
    (point) => point.properties?.point_count
  ) as [number, number];
  const circleScale = scaleLog().domain(domain).range([20, 35]);

  const getClusterIcon = (count: number, size: number) => {
    return L.divIcon({
      className: "cluster-marker",
      iconSize: [size, size],
      iconAnchor: [10, 10],
      html: `${count}`,
    });
  };

  if (!bounds || !zoom || !mapRef.current || !data) return;

  return (
    clusters &&
    clusters.map((cluster) => {
      const [longitude, latitude] = cluster.geometry.coordinates;
      const { cluster: isCluster } = cluster.properties;

      if (isCluster) {
        const { point_count: pointCount } = cluster.properties;
        return (
          <Marker
            key={`${cluster.id}`}
            position={[latitude, longitude]}
            icon={getClusterIcon(
              pointCount,
              (circleScale(pointCount) * 10) / zoom
            )}
            eventHandlers={{
              click: () => {
                const expansionZoom = Math.min(
                  supercluster?.getClusterExpansionZoom(
                    cluster.id! as number
                  ) ?? 0,
                  17
                );
                mapRef.current?.setView([latitude, longitude], expansionZoom, {
                  animate: true,
                });
              },
            }}
          />
        );
      }

      return (
        <CircleMarker
          key={`${cluster.properties.chargeDeviceID}`}
          center={[latitude, longitude]}
          fillColor={colorScaleD3(cluster.properties.deviceControllerName)}
          fillOpacity={0.5}
          radius={7}
          stroke={true}
          color="white"
          weight={1}
        >
          <Popup>
            <h3 className="font-bold">{cluster.properties.name}</h3>
            <dl className="grid grid-cols-[70px_1fr]">
              <dt>Postcode: </dt>
              <dd>{cluster.properties.postcode}</dd>
              <dt>Operator: </dt>
              <dd>{cluster.properties.deviceControllerName}</dd>
              <dt>Status: </dt>
              <dd>{cluster.properties.chargeDeviceStatus}</dd>
            </dl>
          </Popup>
        </CircleMarker>
      );
    })
  );
};
