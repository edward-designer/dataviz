import { AnimatePresence } from "framer-motion";
import { PropsWithChildren } from "react";

const TariffComparisionCardsContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
      <AnimatePresence>{children} </AnimatePresence>
    </div>
  );
};

export default TariffComparisionCardsContainer;
