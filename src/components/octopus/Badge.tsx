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
      className={`font-display font-bold text-xs inline-block text-white px-2 ml-2 rounded-md align-middle ${
        variant === "default"
          ? "border-accentPink-500 border"
          : "bg-black mix-blend-multiply"
      }`}
    >
      {label}
    </span>
  );
};
export default Badge;
