"use client";

import Lottie from "lottie-react";
import octopusIcon from "../../public/lottie/octopus.json";

export default function Loading() {
  return (
    <div className="fixed h-screen w-screen flex items-center justify-center flex-col">
      <Lottie
        animationData={octopusIcon}
        aria-hidden={true}
        className="w-20 h-20"
      />
      <span className="text-sm font-light text-center">Loading...</span>
    </div>
  );
}
