import { IoMdTrendingDown } from "react-icons/io";
import { IoMdTrendingUp } from "react-icons/io";
import { CgMathEqual } from "react-icons/cg";
import { ReactNode, useContext } from "react";
import { evenRound } from "@/utils/helpers";
import { HiVizContext } from "@/context/hiViz";

const Comparison = ({
  change,
  compare,
  isExport = false,
  children,
}: {
  change: number | null;
  compare: string;
  isExport?: boolean;
  children?: ReactNode;
}) => {
  const { hiViz } = useContext(HiVizContext);

  if (change === null) return;
  const ChangeIcon =
    change === 0 ? CgMathEqual : change > 0 ? IoMdTrendingUp : IoMdTrendingDown;
  return (
    <div className="font-display text-xs flex flex-col items-start ml-2 border-l border-accentBlue-700 pl-2">
      <span
        className={`font-display text-base inline-block  pr-[4px] rounded-md leading-[1] ${
          (change > 15 && !isExport) || (change < -15 && isExport)
            ? hiViz
              ? "text-yellow-300"
              : "text-red-500"
            : (change < -15 && !isExport) || (change > 15 && isExport)
            ? "text-green-500"
            : "text-white"
        }`}
      >
        <ChangeIcon
          className={`w-3 h-3 inline-block mr-1 ${
            (change > 0 && !isExport) || (change < 0 && isExport)
              ? hiViz
                ? "text-yellow-300"
                : "text-red-500"
              : "text-green-500"
          }`}
        />
        {change > 0 ? "+" : ""}
        {evenRound(change, 1)}%
      </span>
      <span className=" text-slate-300 font-sans text-xs flex leading-[1]">
        vs {compare} {children}
      </span>
    </div>
  );
};

export default Comparison;
