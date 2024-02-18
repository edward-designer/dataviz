"use client";
import { ReactNode, useContext, useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { TVariant } from "@/data/source";
import { WindowVisibilityContext } from "@/context/windowVisibility";

const Remark = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: TVariant;
}) => {
  const [open, setOpen] = useState(false);
  const { focus } = useContext(WindowVisibilityContext);

  useEffect(() => {
    if (focus) setOpen(false);
  }, [focus]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <IoIosInformationCircleOutline
          className={`${
            variant === "badge"
              ? "w-6 h-6 -translate-y-1 md:translate-y-0 ml-1 md:w-4 md:h-4 md:-mt-[2px]"
              : variant === "heading"
              ? "w-6 h-6"
              : "w-6 h-6 ml-2 translate-y-1"
          } text-accentBlue-500/90`}
          aria-hidden={true}
        />
        <span className="sr-only">Remarks:</span>
      </PopoverTrigger>
      <PopoverContent
        className={`border-0 bg-theme-900/95 text-base max-h-[50vh] overflow-y-auto py-4`}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default Remark;
