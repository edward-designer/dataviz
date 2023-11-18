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
    <div className="font-display text-xs flex flex-col justify-center mx-2">
      <span
        className={`font-display font-bold text-xs inline-block text-white px-[4px] rounded-md items-center ${
          change > 0 ? "bg-red-700/70" : "bg-green-700/70"
        }`}
      >
        <ChangeIcon className="text-white w-3 h-3 inline-block mr-1" />
        {change > 0 ? "+" : ""}
        {change}%
      </span>
      <span className="text-slate-300 text-[10px] flex items-center">
        vs {compare} {children}
      </span>
    </div>
  );
};

export default Comparison;
