type TVariant = "default" | "secondary";

const Badge = ({
  label,
  variant = "default",
}: {
  label: string;
  variant?: TVariant;
}) => {
  return (
    <span
      className={`font-display inline-block text-white/60 rounded-md align-middle ${
        variant === "default"
          ? "border-accentPink-500 border px-2 ml-2 text-xs"
          : "text-base"
      }`}
    >
      {label}
    </span>
  );
};
export default Badge;
