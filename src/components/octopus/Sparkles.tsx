import useRandomInterval from "@/hooks/useRandomInterval";
import { random, range } from "@/utils/helpers";
import { CSSProperties, PropsWithChildren, useState } from "react";

const DEFAULT_COLOR = "#FFC70080";
const generateSparkle = (color: CSSProperties["color"]) => {
  const sparkle = {
    id: String(random(10000, 99999)),
    createdAt: Date.now(),
    color,
    size: random(10, 20),
    style: {
      top: random(0, 100) + "%",
      left: random(0, 100) + "%",
    },
  };
  return sparkle;
};

interface ISparkles extends PropsWithChildren {
  color?: CSSProperties["color"];
}
const Sparkles = ({
  color = DEFAULT_COLOR,
  children,
  ...delegated
}: ISparkles) => {
  const [sparkles, setSparkles] = useState(() => {
    return range(4).map(() => generateSparkle(color));
  });
  useRandomInterval(
    () => {
      const sparkle = generateSparkle(color);
      const now = Date.now();
      const nextSparkles = sparkles.filter((sp) => {
        const delta = now - sp.createdAt;
        return delta < 750;
      });
      nextSparkles.push(sparkle);
      setSparkles(nextSparkles);
    },
    200,
    650
  );
  return (
    <span className="inline-block relative" {...delegated}>
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          color={sparkle.color}
          size={sparkle.size}
          style={sparkle.style}
        />
      ))}
      <strong className="relative z-10 font-bold">{children}</strong>
    </span>
  );
};

interface ISparkle {
  size: number;
  color: CSSProperties["color"];
  style: CSSProperties;
}
const Sparkle = ({ size, color, style }: ISparkle) => {
  const path =
    "M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z";
  return (
    <span className="absolute block animate-come-in-out z-20" style={style}>
      <svg
        className="block animate-spin"
        width={size}
        height={size}
        viewBox="0 0 68 68"
        fill="none"
      >
        <path d={path} fill={color} />
      </svg>
    </span>
  );
};

export default Sparkles;
