import { IMapData } from "@/hooks/useMap";
import {
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  geoGraticule,
  select,
  zoom,
  drag,
  scaleLinear,
} from "d3";
import { Feature } from "geojson";
import { useState, useRef, useEffect, RefObject } from "react";

interface IMarks {
  data: IMapData;
  width: number;
  height: number;
  selectedCountry: Feature | null;
  setSelectedCountry: (feature: Feature | null) => void;
  svgRef: RefObject<SVGSVGElement | null>;
}

type D3DragEvent = DragEvent & { dy: Number; dx: number };
type D3ZoomEvent = MouseEvent & { transform: { k: number } };

const Marks = ({
  data: { countries },
  width,
  height,
  selectedCountry,
  setSelectedCountry,
  svgRef,
}: IMarks) => {
  const initialScale = 300;
  const [scale, setScale] = useState(300);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const isDragging = useRef(false);
  const globeRef = useRef<SVGGElement>(null);

  var λ = scaleLinear().domain([-width, width]).range([-180, 180]);
  var φ = scaleLinear().domain([-height, height]).range([90, -90]);

  const projection = geoOrthographic()
    .scale(scale)
    .translate([width / 2, height / 2])
    .rotate(rotation)
    .center([0, 0])
    .clipAngle(90);
  const path = geoPath().projection(projection);
  const graticule = geoGraticule();

  /*country name label position*/
  const [countryNamePos, setCountryNamePos] = useState({ x: 0, y: 0 });

  /*rotation*/
  useEffect(() => {
    const handleDragStart = (d: DragEvent) => {
      isDragging.current = true;
      setSelectedCountry(null);
    };
    const handleDragEnd = (d: DragEvent) => {
      isDragging.current = false;
    };

    const handleDrag = (d: D3DragEvent) => {
      setRotation((rotation) => {
        const r = {
          x: λ(
            (rotation[1] % 360 > 90 && rotation[1] % 360 < 270) ||
              (rotation[1] % 360 < -90 && rotation[1] % 360 > -270)
              ? -d.dx
              : d.dx
          ),
          y: φ(d.dy),
        };
        return [rotation[0] + r.x, rotation[1] + r.y];
      });
    };

    if (!globeRef.current) return;
    select(globeRef.current as Element).call(
      drag()
        .on("start", handleDragStart)
        .on("drag", handleDrag)
        .on("end", handleDragEnd)
    );
  }, [setSelectedCountry, λ, φ]);

  /*zoom*/
  useEffect(() => {
    const handleZoom = (event: D3ZoomEvent) => {
      setScale((scale) => {
        return initialScale * event.transform.k;
      });
    };
    if (!svgRef.current) return;
    const svg = select(svgRef.current as Element).call(
      zoom().on("zoom", handleZoom)
    );
  }, []);

  return (
    <g ref={globeRef}>
      <path className="fill-accentBlue-50" d={path({ type: "Sphere" })!} />
      <path
        className="fill-none stroke-accentBlue-100"
        d={path(graticule()) ?? undefined}
      />
      {countries.features.map((feature) => (
        <path
          className=" fill-theme-950 stroke-accentBlue-300"
          key={feature.id}
          d={path(feature) ?? undefined}
          onMouseEnter={(e) => {
            if (isDragging.current) return;
            setSelectedCountry(feature);
            const {
              top,
              left,
              width: cWidth,
              height,
            } = e.currentTarget.getBoundingClientRect();
            setCountryNamePos({
              x: Math.round(left + cWidth / 2),
              y: Math.round(top + height / 2),
            });
          }}
        />
      ))}
      {selectedCountry && !isDragging.current && (
        <g>
          <path
            className=" fill-accentPink-500 stroke-accentBlue-300"
            key={selectedCountry.id}
            d={path(selectedCountry) ?? undefined}
          />
          <text
            x={countryNamePos.x}
            y={countryNamePos.y}
            alignmentBaseline="after-edge"
            textAnchor="middle"
            className="stroke-accentBlue-50/90 stroke-[4]"
          >
            {selectedCountry?.properties?.name}
          </text>
          <text
            x={countryNamePos.x}
            y={countryNamePos.y}
            alignmentBaseline="after-edge"
            textAnchor="middle"
          >
            {selectedCountry?.properties?.name}
          </text>
        </g>
      )}
    </g>
  );
};

export default Marks;
