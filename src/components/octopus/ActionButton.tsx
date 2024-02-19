import { ReactNode, MouseEvent, PropsWithChildren } from "react";
import Button from "./Button";

interface IActionButton extends PropsWithChildren {
  className?: string;
  isActive?: boolean;
  clickHandler: (event: MouseEvent<HTMLButtonElement>) => void;
}

const ActionButton = ({
  children,
  className,
  isActive = false,
  clickHandler,
}: IActionButton) => {
  return (
    <Button
      className={`border rounded-lg flex items-center gap-1 px-4 py-1 transition-all text-sm ${
        isActive
          ? "text-accentPink-500 border-accentPink-500 bg-accentPink-900/30"
          : "border-theme-500 hover:text-white hover:bg-accentPink-950 hover:border-accentPink-500 active:bg-accentPink-900 active:border-accentPink-900"
      } ${className}`}
      clickHandler={clickHandler}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
