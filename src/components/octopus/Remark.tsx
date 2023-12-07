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
            variant === "badge" ? "w-4 h-4 ml-1 -mt-[2px]" : "w-6 h-6 ml-2"
          } text-accentBlue-500/90`}
          aria-hidden={true}
        />
        <span className="sr-only">Remarks:</span>
      </PopoverTrigger>
      <PopoverContent className={`border-0 bg-theme-900/80 text-xs`}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default Remark;
