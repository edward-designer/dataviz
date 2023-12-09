import { ReactNode } from "react";

type TVariant = "default" | "primary" | "secondary" | "item";

const Badge = ({
  label,
  variant = "default",
  icon = null,
}: {
  label: string;
  variant?: TVariant;
  icon?: ReactNode;
}) => {
  return (
    <span
      className={` text-white/80 rounded-md align-middle font-normal 
      ${
        variant === "primary"
          ? "bg-accentPink-500 text-2xl px-4 py-0 font-display "
          : variant === "default"
          ? "border-accentPink-500 border px-2 ml-2 text-sm inline-block font-display "
          : variant === "secondary"
          ? "text-base flex items-center gap-1 font-display"
          : "text-base flex items-center gap-1 "
      }`}
    >
      {icon}
      {label}
    </span>
  );
};
export default Badge;
