"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

// customize to optimize re-render: defaultValue from number[] to number

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "defaultValue"
  > & { defaultValue: number; isExport?: boolean }
>(({ className, slot, defaultValue, isExport = false, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue);
  const [isFocus, setIsFocus] = React.useState(false);
  const tractHeight = 100;
  const min = props.min ? props.min : 0;
  const max = props.max ? props.max : tractHeight;

  const stopPercentRaw = Math.floor((((value ?? 0) - min) / (max - min)) * 100);
  const stopPercent = isExport ? 100 - stopPercentRaw : stopPercentRaw;

  React.useEffect(() => setValue(defaultValue), [defaultValue]);

  const trackGradientStop = isExport
    ? ({
        "--tw-gradient-via-position": `${stopPercent}%`,
        "--tw-gradient-from-position": `${stopPercent}%`,
      } as React.CSSProperties)
    : ({
        "--tw-gradient-to-position": `${stopPercent}%`,
        "--tw-gradient-via-position": `${stopPercent}%`,
      } as React.CSSProperties);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center flex-col w-5 h-[150px]",
        className
      )}
      value={[value]}
      defaultValue={[value]}
      onValueChange={(value: number[]) => setValue(value[0])}
      {...props}
    >
      <SliderPrimitive.Track
        className={`relative w-2 transition-all duration-500 grow overflow-hidden rounded-full 
       shadow-black shadow-[inset_2px_2px_3px_0_rgba(0,0,0,0.5)] 
      bg-gradient-to-t ${
        isExport
          ? "to-orange-700 from-slate-700 via-yellow-700"
          : "via-accentBlue-500 from-blue-900 to-slate-700 "
      }`}
        style={trackGradientStop}
      >
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={`relative block h-5 w-5 rounded-full shadow-[4px_4px_6px_0_rgba(0,0,0,0.5)] shadow-black  focus-visible:bg-accentPink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentPink-500 disabled:pointer-events-none disabled:opacity-50 
    ${isExport ? "bg-orange-950" : "bg-accentBlue-950"}`}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      >
        {isFocus ? (
          <span
            className={`text-xs absolute left-1/2 -bottom-[1px] leading-tight text-center w-fit -translate-x-1/2 min-w-8 min-h-8 bg-accentPink-500 p-1 rounded-full`}
          >
            {value}
          </span>
        ) : (
          <span
            className={`opacity-50 text-[10px] absolute w-full bottom-[3px] leading-tight text-center`}
          >
            {value}
          </span>
        )}
      </SliderPrimitive.Thumb>
      {!isExport && <span className="text-xs absolute -bottom-6">{slot}</span>}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export default React.memo(Slider);
