import L from "leaflet";

const iconPin = new L.Icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconSize: new L.Point(15, 25),
  className: "pin-icon",
});

export { iconPin };
