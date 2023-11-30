import { evenRound } from "../../utils/helpers";

const FormattedPrice = ({ price }: { price: number }) => (
  <div>
    {evenRound(price, 2, true)}
    <span className="text-sm font-thin font-sans pl-1 leading-tight">p</span>
  </div>
);

export default FormattedPrice;
