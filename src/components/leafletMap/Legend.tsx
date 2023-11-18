import { CSSProperties, useLayoutEffect, useState } from "react";
import { RiMenuSearchLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

import { mobileWidth } from "@/app/chargePoint/define";

const Legend = ({
  categories,
  colorScale,
  others,
}: {
  categories: string[];
  colorScale: (key: string) => CSSProperties["color"];
  others?: { name: string; color: CSSProperties["color"] };
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useLayoutEffect(() => {
    const checkWinWidth = () => {
      if (window.innerWidth < mobileWidth) setIsShowing(false);
    };
    if (window.innerWidth >= mobileWidth) setIsShowing(true);
    window.addEventListener("resize", checkWinWidth);
    return () => window.removeEventListener("resize", checkWinWidth);
  }, []);

  return (
    <>
      <div
        className={` absolute bottom-12 sm:bottom-4 right-0 z-40 pl-6 overflow-x-hidden ${
          isShowing ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          className={`${
            isShowing ? "left-0" : "left-full -translate-x-full"
          } absolute w-6 h-6 pointer-events-auto bg-white/70 top-0 text-gray-500 text-xl flex justify-center items-center`}
          onClick={() => setIsShowing((isShowing) => !isShowing)}
          aria-label="Legend Toggle"
        >
          {isShowing ? <RxCross2 fill="red" /> : <RiMenuSearchLine />}
        </button>
        <div
          className={`${
            isShowing ? "" : "translate-x-full"
          } transition-all backdrop-blur-sm backdrop-brightness-110 p-4 flex gap-2 flex-col max-h-[calc(100dvh-200px)]  overflow-y-auto`}
        >
          <h3 className="font-bold border-b">Legend</h3>
          {categories.sort().map((key) => {
            return (
              <div
                key={key}
                className="flex align-middle justify-start gap-2 text-sm"
              >
                <span
                  className="inline-block w-3"
                  style={{ backgroundColor: `${colorScale(key)}` }}
                ></span>
                {key}
              </div>
            );
          })}
          {others && (
            <div className="flex align-middle justify-start gap-2 text-sm">
              <span
                className="inline-block w-3"
                style={{ backgroundColor: others.color }}
              ></span>
              {others.name}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Legend;
