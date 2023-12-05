import { ReactNode } from "react";

type TVariant = "default" | "primary" | "secondary";

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
      className={`font-display  text-white/60 rounded-md align-middle 
      ${
        variant === "primary"
          ? "bg-accentPink-500 text-2xl px-4 py-0"
          : variant === "default"
          ? "border-accentPink-500 border px-2 ml-2 text-xs inline-block"
          : "text-base flex items-center gap-1"
      }`}
    >
      {icon}
      {label}
    </span>
  );
};
export default Badge;
