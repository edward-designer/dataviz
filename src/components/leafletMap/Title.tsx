import { memo } from "react";

const Title = ({ title, source }: { title: string; source: string }) => {
  return (
    <div className="absolute bottom-4 sm:bottom-1 left-0 right-0 sm:right-auto p-2 z-50 bg-white/50 backdrop-blur-[2px] sm:backdrop-blur-none sm:bg-transparent">
      <h1 className="font-bold text-2xl sm:text-3x leading-5">
        {title}
        <span className="text-xs pl-1">
          [
          <a href={source} target="_blank">
            source
          </a>
          ]
        </span>
      </h1>
    </div>
  );
};

export default memo(Title);
