import { ReactNode, MouseEvent, PropsWithChildren } from "react";
import Button from "./Button";

interface ISelectPeriodButton extends PropsWithChildren {
  className?: string;
  isActive?: boolean;
  clickHandler: (event: MouseEvent<HTMLButtonElement>) => void;
}

const SelectPeriodButton = ({
  children,
  className,
  isActive = false,
  clickHandler,
}: ISelectPeriodButton) => {
  return (
    <Button
      className={`border rounded-lg font-normal ${
        isActive
          ? "text-theme-950 border-accentPink-500 bg-accentPink-500 bg-accentPink-900/30"
          : "border-slate-300 hover:text-accentPink-500 hover:border-accentPink-500"
      } ${className}`}
      clickHandler={clickHandler}
    >
      {children}
    </Button>
  );
};

export default SelectPeriodButton;
