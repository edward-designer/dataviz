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
import Remark from "./Remark";
import Lottie from "lottie-react";
import octopusIcon from "../../../public/lottie/octopus.json";

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
  const { cost, isLoading, error } = useConsumptionCalculation({
    tariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
  });

  useEffect(() => {
    if (Number.isNaN(cost)) return;
    if (cost !== null && typeof cost === "number") setCost(category, cost);
  }, [category, cost, setCost]);

  const Container =
    cost !== null && !Number.isNaN(cost) && rank === 1 ? Sparkles : "div";

  if (!isLoading && error) {
    if (rank === 1) {
      return (
        <div
          className="px-4 py-16 lg:py-20 relative flex-1 flex flex-col gap-8 rounded-xl bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
          style={{
            backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
          }}
        >
          <div className="flex-1 flex h-full items-center justify-center flex-col gap-2">
            <Lottie
              animationData={octopusIcon}
              aria-hidden={true}
              className="w-16 h-16"
            />
            <span className="text-sm font-light text-center">{error}</span>
          </div>
        </div>
      );
    } else return;
  }

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
      ) : typeof cost === "number" && !Number.isNaN(cost) ? (
        <>
          <EnergyIcon type={type} />
          <Container>
            {category === "Agile" || category === "Tracker" ? (
              <a href={`/${category.toLowerCase()}`} className="block">
                <Badge label={`Octopus ${category}`} variant="primary" />
              </a>
            ) : (
              <Badge
                label={`Octopus ${
                  category === "SVT" ? "Variable Tariff" : category
                }`}
                variant="primary"
              />
            )}
          </Container>
          <Container>
            <div className="text-5xl">
              <span>
                £<AnimatedDigits to={evenRound(cost, 2)} />
              </span>
              {category === "Go" || category === "Cosy" ? (
                <Remark>
                  <div className="text-xs">
                    <strong>
                      The price shown here does NOT take into accounts the
                      effects of Ofgem price caps.
                    </strong>{" "}
                    If the Go/Cosy tariff is <strong>NOT on fixed terms</strong>{" "}
                    (i.e. without an end date), it should be protected by the
                    price caps. Octopus Energy will do all the complex
                    calculations at the end of each contract month to make
                    adjustments to any charges over the price caps. In effect,
                    one will NOT be charged more than the Octopus Flexible
                    tariff. Octopus does not state this clearly, but it can be
                    inferred from this statement:{" "}
                    <span className="italic">
                      &quot;without a fixed term the tariff will be subject to
                      the price cap&quot; -{" "}
                      <a
                        href="https://octopus.energy/tracker-faqs/"
                        target="_blank"
                        className="underline"
                      >
                        Octopus Energy website
                      </a>
                    </span>
                    .
                  </div>
                </Remark>
              ) : (
                ""
              )}
            </div>
          </Container>
          {category !== "SVT" ? (
            compareTo && (
              <div className="flex flex-row font-normal">
                {compareTo - cost > 0 ? (
                  <span className="text-accentBlue-500">
                    saves £
                    <AnimatedDigits to={evenRound(compareTo - cost, 2)} />
                  </span>
                ) : (
                  <span className="text-accentPink-500">
                    £
                    <AnimatedDigits
                      to={Math.abs(evenRound(compareTo - cost, 2))}
                    />{" "}
                    more
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
      ) : (
        <div className="text-center text-sm">
          Sorry, we are experiencing some technical errors at the moment. Please
          try again later.
        </div>
      )}
    </motion.div>
  );
};

export default memo(TariffComparisionCard);
