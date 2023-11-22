import { PropsWithChildren, MouseEvent } from "react";
interface IButton extends PropsWithChildren {
  clickHandler: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "default" | "action";
}

const Button = ({
  children,
  clickHandler,
  variant,
  className,
  ...props
}: IButton) => {
  return (
    <button
      className={`p-2 rounded-lg opacity-70 hover:opacity-100 ${
        variant === "action" ? "border border-accentPink-600" : ""
      } ${className}`}
      onClick={clickHandler}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
