import { evenRound } from "../../utils/helpers";

const FormattedPrice = ({
  price,
  value = "pence",
}: {
  price: number;
  value?: "pence" | "pound";
}) => (
  <div>
    {value === "pound" && (
      <span className="text-sm font-thin font-sans pl-1 leading-tight">£</span>
    )}
    {evenRound(price, 2, true)}
    {value === "pence" && (
      <span className="text-sm font-thin font-sans pl-1 leading-tight">p</span>
    )}
  </div>
);

export default FormattedPrice;
