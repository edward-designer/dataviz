"use client";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import Lottie from "lottie-react";

import octopusIcon from "../../public/lottie/octopus.json";

export default function Loading() {
  return (
    <div className="lg:col-[content] h-screen w-full flex items-center justify-center flex-col">
      <Lottie
        animationData={octopusIcon}
        aria-hidden={true}
        className="w-20 h-20"
      />
      <span className="text-sm font-light text-center">Loading...</span>
    </div>
  );
}
