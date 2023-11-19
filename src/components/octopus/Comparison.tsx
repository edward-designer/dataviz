import { IoMdTrendingDown } from "react-icons/io";
import { IoMdTrendingUp } from "react-icons/io";
import { CgMathEqual } from "react-icons/cg";
import { ReactNode } from "react";

const Comparison = ({
  change,
  compare,
  children,
}: {
  change: number | null;
  compare: string;
  children?: ReactNode;
}) => {
  if (change === null) return;
  const ChangeIcon =
    change === 0 ? CgMathEqual : change > 0 ? IoMdTrendingUp : IoMdTrendingDown;
  return (
    <div className="font-display text-xs flex flex-col items-start ml-2 border-l border-theme-800 pl-2">
      <span
        className={`font-display text-xs inline-block  pr-[4px] rounded-md ${
          change > 15
            ? "text-red-500"
            : change < -15
            ? "text-green-500"
            : "text-white"
        }`}
      >
        <ChangeIcon
          className={`w-3 h-3 inline-block mr-1 ${
            change > 0 ? "text-red-500" : "text-green-500"
          }`}
        />
        {change > 0 ? "+" : ""}
        {change}%
      </span>
      <span className="font-thin text-slate-300 text-[10px] flex">
        vs {compare} {children}
      </span>
    </div>
  );
};

export default Comparison;
