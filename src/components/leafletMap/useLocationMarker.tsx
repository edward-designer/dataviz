import { useState, useEffect, MutableRefObject } from "react";

import { Marker, Popup } from "react-leaflet";
import L, { LocationEvent, LatLng, Map } from "leaflet";

const useLocationMarker = (mapRef: MutableRefObject<Map | null>) => {
  const [position, setPosition] = useState<LatLng | null>(null);

  const icon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [2, -40],
    iconUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.6/dist/images/marker-shadow.png",
  });

  const handleFindMe = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.locate().on("locationfound", function (e: LocationEvent) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 13);
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      circle.addTo(map);
    });
  };

  const LocationMarker = () =>
    position === null ? null : (
      <Marker position={position} icon={icon}>
        <Popup>You are here.</Popup>
      </Marker>
    );

  return { LocationMarker, handleFindMe };
};

export default useLocationMarker;
