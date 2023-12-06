import { TariffCategory, TariffType } from "@/data/source";
import useConsumptionCalculation from "../../hooks/useConsumptionCalculation";
import { EnergyIcon } from "./EnergyIcon";
import Badge from "./Badge";
import { evenRound } from "@/utils/helpers";
import Loading from "../Loading";
import { memo, useEffect } from "react";
import Comparison from "./Comparison";
import { motion } from "framer-motion";
import AnimatedDigits from "./AnimatedDigits";
import Sparkles from "./Sparkles";

interface ITariffComparisionCard {
  deviceNumber: string;
  serialNo: string;
  tariff: string;
  fromDate: string;
  toDate: string;
  type: Exclude<TariffType, "EG">;
  category: TariffCategory;
  compareTo: null | number;
  setCost: (category: TariffCategory, cost: number) => void;
  rank: number;
}
const TariffComparisionCard = ({
  deviceNumber,
  serialNo,
  tariff,
  fromDate,
  toDate,
  type,
  category,
  compareTo,
  setCost,
  rank,
}: ITariffComparisionCard) => {
  const { cost } = useConsumptionCalculation({
    tariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
  });

  useEffect(() => {
    if (cost !== null) setCost(category, cost);
  }, [category, cost, setCost]);

  const Container = cost !== null && rank === 1 ? Sparkles : "div";

  return (
    <motion.div
      transition={{ delay: 1 }}
      layoutId={`${type}-${category}`}
      className={`relative flex-1 border border-accentPink-500/30 min-h-[200px] lg:h-[300px] rounded-2xl flex flex-col justify-center items-center gap-2 bg-cover bg-tops ${
        cost !== null ? `first:border-accentPink-500 first:bg-tariffWinner` : ""
      }`}
    >
      {cost === null ? (
        <Loading />
      ) : (
        <>
          <EnergyIcon type="E" />
          <Container>
            <a href={`/${category.toLowerCase()}`}>
              <Badge
                label={`Octopus ${
                  category === "SVT" ? "Variable Tariff" : category
                }`}
                variant="primary"
              />
            </a>
          </Container>
          <Container>
            <div className="text-5xl">
              <span>
                £<AnimatedDigits to={evenRound(cost, 2)} />
              </span>
            </div>
          </Container>
          {category !== "SVT" ? (
            compareTo && (
              <div className="flex flex-row">
                {compareTo - cost > 0 ? (
                  <span className="text-accentBlue-500">
                    saves £
                    <AnimatedDigits to={evenRound(compareTo - cost, 2)} />
                  </span>
                ) : (
                  <span className="text-accentPink-500">
                    £<AnimatedDigits to={evenRound(compareTo - cost, 2)} /> more
                  </span>
                )}
                <Comparison
                  change={evenRound(((cost - compareTo) * 100) / compareTo, 0)}
                  compare="Variable Tariff"
                />
              </div>
            )
          ) : (
            <div className="text-xs">
              the standard tariff protected by Energy Price Cap
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default memo(TariffComparisionCard);
