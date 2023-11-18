import { IMapData } from "@/hooks/useMap";
import {
  geoNaturalEarth1,
  geoOrthographic,
  geoPath,
  geoGraticule,
  pointer,
} from "d3";
import { Feature } from "geojson";
import { useState, useRef, MouseEvent } from "react";
import { eulerAngles } from "@/utils/rotateSphere";

interface IMarks {
  data: IMapData;
  width: number;
  height: number;
  selectedCountry: Feature | null;
  setSelectedCountry: (feature: Feature | null) => void;
}

const Marks = ({
  data: { countries },
  width,
  height,
  selectedCountry,
  setSelectedCountry,
}: IMarks) => {
  /*rotate the globe*/
  const [rotation, setRotation] = useState<
    [number, number] | [number, number, number]
  >([0, 0, 0]);

  const projection = geoOrthographic().fitExtent(
    [
      [10, 10],
      [width - 10, height - 10],
    ],
    { type: "Sphere" }
  );
  projection?.rotate(rotation);
  const path = geoPath(projection);
  const graticule = geoGraticule();

  /*country name label position*/
  const [countryNamePos, setCountryNamePos] = useState({ x: 0, y: 0 });

  /*rotate the globe*/
  const draggingRef = useRef(false);
  const pointerPosition = useRef<[number, number] | null>(null);
  const rotationPosition = useRef(projection.rotate());
  projection;

  const handleMouseMove = (e: MouseEvent<SVGGElement>) => {
    if (!draggingRef.current || !projection) return;

    const newPointerPosition = projection.invert!(pointer(e));

    const newRotation = eulerAngles(
      pointerPosition.current,
      newPointerPosition,
      projection.rotate()
    ) as any as [number, number, number];

    rotationPosition.current = projection.rotate();
    pointerPosition.current = newPointerPosition;

    setRotation(newRotation);
  };

  return (
    <g
      onMouseDown={(e) => {
        setSelectedCountry(null);
        pointerPosition.current = projection.invert!(pointer(e));
        draggingRef.current = true;
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={(e) => {
        draggingRef.current = false;
      }}
      onMouseLeave={() => {
        draggingRef.current = false;
      }}
    >
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
      {selectedCountry && (
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
