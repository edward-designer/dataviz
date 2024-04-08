"use client";

import Lottie from "lottie-react";
import lightSwitch from "../../../public/lottie/lightSwitch.json";
import octopus from "../../../public/lottie/octopusC.json";
import steps from "../../../public/lottie/steps.json";
import faq from "../../../public/lottie/faq.json";
import save from "../../../public/lottie/save.json";
import tool from "../../../public/lottie/tool2.json";

const LottieIcon = ({
  icon,
  loop = true,
}: {
  icon: string;
  loop?: boolean;
}) => {
  let lottieJSON;
  switch (icon) {
    case "lightSwitch":
      lottieJSON = lightSwitch;
      break;
    case "octopus":
      lottieJSON = octopus;
      break;
    case "steps":
      lottieJSON = steps;
      break;
    case "faq":
      lottieJSON = faq;
      break;
    case "save":
      lottieJSON = save;
      break;
    case "tool":
      lottieJSON = tool;
      break;
    default:
      lottieJSON = lightSwitch;
  }
  return (
    <div className="flex items-center justify-center">
      <Lottie
        animationData={lottieJSON}
        autoPlay={false}
        loop={loop}
        aria-hidden={true}
        className="w-40 h-40"
      />
    </div>
  );
};

export default LottieIcon;
