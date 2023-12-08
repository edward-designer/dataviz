"use client";
import { ENERGY_TYPE, TariffType } from "@/data/source";
import Lottie from "lottie-react";
import electricityIcon from "../../../public/lottie/electricity.json";
import gasIcon from "../../../public/lottie/gas.json";

export const EnergyIcon = ({
  type,
  position = "right",
}: {
  type: Exclude<TariffType, "EG">;
  position?: "left" | "right";
}) => {
  return (
    <div
      className={`absolute top-2 ${
        position === "right" ? `right-0` : `left-0`
      }`}
    >
      <Lottie
        animationData={type === "G" ? gasIcon : electricityIcon}
        loop={2}
        aria-hidden={true}
        className="w-16 h-16"
        initialSegment={[0, 25]}
      />
      <span className="text-accentBlue-600 -mt-2 sr-only">
        {ENERGY_TYPE[type]}
      </span>
    </div>
  );
};
