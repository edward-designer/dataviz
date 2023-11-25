"use client";
import { MutableRefObject } from "react";
import { Marker, Popup, CircleMarker } from "react-leaflet";
import L, { Map } from "leaflet";
import useSupercluster from "use-supercluster";
import { extent, scaleLog } from "d3";
import { BBox } from "geojson";
import { TPoints, TCluster, colorScaleD3 } from "../../app/petrol/define";

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
    options: {
      radius: 700 / zoom,
      maxZoom: 12,
      map: (props) => ({
        lowest: props.prices.E10 ?? Infinity,
      }),
      reduce: (acc, props) => {
        acc.lowest = props.lowest
          ? Math.min(acc.lowest, props.lowest)
          : acc.lowest;
      },
    },
  });

  const domain = extent(
    clusters.filter((point) => point.properties.cluster) as TCluster[],
    (point) => point.properties?.point_count
  ) as [number, number];
  const circleScale = scaleLog().domain(domain).range([30, 50]);

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
        const { point_count: pointCount, lowest } = cluster.properties;
        return (
          <Marker
            key={`${cluster.id}`}
            position={[latitude, longitude]}
            icon={getClusterIcon(lowest, (circleScale(pointCount) * 10) / zoom)}
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

      const iconText = L.divIcon({
        html: cluster.properties.prices.E10
          ? `${cluster.properties.prices.E10}p`
          : "N/A",
      });
      return (
        <CircleMarker
          key={`${cluster.properties.siteID}`}
          center={[latitude, longitude]}
          fillColor={colorScaleD3(cluster.properties.brand)}
          fillOpacity={0.5}
          radius={20}
          stroke={true}
          color="white"
          weight={1}
        >
          <Marker position={[latitude, longitude]} icon={iconText} />
          <Popup>
            <h3 className="font-bold">{cluster.properties.postcode}</h3>
            <dl className="grid grid-cols-[70px_1fr]">
              <dt>E10 Price: </dt>
              <dd>{cluster.properties.prices.E10}p</dd>
              <dt>E5 Price: </dt>
              <dd>{cluster.properties.prices.E5}p</dd>
              <dt>Disel Price: </dt>
              <dd>{cluster.properties.prices.B7}p</dd>
            </dl>
          </Popup>
        </CircleMarker>
      );
    })
  );
};
