import { TariffCategory, TariffType } from "@/data/source";
import useConsumptionCalculation from "../../hooks/useConsumptionCalculation";
import { EnergyIcon } from "./EnergyIcon";
import Badge from "./Badge";
import { evenRound } from "@/utils/helpers";
import Loading from "../Loading";
import { memo } from "react";
import Comparison from "./Comparison";

interface ITariffComparisionCard {
  MPAN: string;
  ESerialNo: string;
  tariff: string;
  fromDate: string;
  toDate: string;
  type?: "E";
  category: TariffCategory;
  compareTo: null | number;
}
const TariffComparisionCard = ({
  MPAN,
  ESerialNo,
  tariff,
  fromDate,
  toDate,
  type = "E",
  category,
  compareTo,
}: ITariffComparisionCard) => {
  const { cost } = useConsumptionCalculation({
    tariff,
    fromDate,
    toDate,
    type,
    category,
    MPAN,
    ESerialNo,
  });

  return (
    <div
      className={`relative flex-1 border border-accentPink-500/30 first:border-accentPink-500 min-h-[200px] lg:h-[300px] rounded-2xl flex flex-col justify-center items-center gap-2 bg-cover bg-tops`}
      style={{
        order: evenRound(cost ?? 0, 0),
        backgroundImage:
          "linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.85) 70%, rgba(0,4,51,0.9) 90% ),url('/images/octopus-winner.jpg')",
      }}
    >
      {cost === null ? (
        <Loading />
      ) : (
        <>
          <EnergyIcon type="E" />
          <a href={`/${category.toLowerCase()}`}>
            <Badge
              label={`Octopus ${
                category === "SVT" ? "Variable Tariff" : category
              }`}
              variant="primary"
            />
          </a>
          <div className="text-5xl">
            <span>£{evenRound(cost, 2, true)}</span>
          </div>
          {category !== "SVT" ? (
            compareTo && (
              <div className="flex flex-row">
                {compareTo - cost > 0 ? (
                  <span className="text-accentBlue-500">
                    saves £{compareTo - cost}
                  </span>
                ) : (
                  <span className="text-accentPink-500">
                    £{compareTo - cost} more
                  </span>
                )}
                <Comparison
                  change={evenRound(((cost - compareTo) * 100) / compareTo, 0)}
                  compare="Variable Tariff"
                />
              </div>
            )
          ) : (
            <div className="text-xs">~ Ofgem energy price cap</div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(TariffComparisionCard);
