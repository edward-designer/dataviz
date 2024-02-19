import { PropsWithChildren, MouseEvent } from "react";
interface IButton extends PropsWithChildren {
  clickHandler: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: "default" | "action";
  type?: "button" | "submit" | "reset";
}

const Button = ({
  children,
  clickHandler,
  variant,
  className,
  type = "button",
  ...props
}: IButton) => {
  return (
    <button
      className={`p-2 rounded-lg opacity-90 hover:opacity-100 ${
        variant === "action" ? "border border-accentPink-600" : ""
      } ${className}`}
      onClick={clickHandler}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
