"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { EnergyIcon } from "@/components/octopus/EnergyIcon";
import Remark from "@/components/octopus/Remark";
import { ENERGY_PLAN, ENERGY_TYPE, TariffType, priceCap } from "@/data/source";
import useCheapestTariffQuery from "@/hooks/useCheapestTariffQuery";
import { evenRound } from "@/utils/helpers";
import Link from "next/link";
import { BsArrowRightSquare } from "react-icons/bs";

import ErrorMessage from "@/components/octopus/ErrorMessage";
import Loading from "@/components/Loading";
import { min } from "d3";

export interface IEnergyPriceCard {
  type: Exclude<TariffType, "EG">;
  plan: ENERGY_PLAN;
}

type CheapestTariffResult =
  | {
      single_register_electricity_tariffs: {
        direct_debit_monthly: {
          standard_unit_rate_inc_vat: number;
        };
      };
    }[]
  | {
      single_register_gas_tariffs: {
        direct_debit_monthly: {
          standard_unit_rate_inc_vat: number;
        };
      };
    }[];

const EnergyPriceCard = ({ type, plan }: IEnergyPriceCard) => {
  const { data, isLoading, isError, isSuccess, error, refetch } =
    useCheapestTariffQuery<CheapestTariffResult>({
      plan,
      type,
      duration: "month",
    });

  let cheapestRate: number = 0;
  if (isSuccess && data) {
    if (plan === "tracker") {
      cheapestRate = evenRound(
        min(
          Object.values(
            data[0][
              `single_register_${ENERGY_TYPE[type]}_tariffs` as keyof CheapestTariffResult
            ]
          ),
          (d) => d["direct_debit_monthly"]["standard_unit_rate_inc_vat"]
        ),
        2
      );
    }
    if (plan === "agile") {
      console.log(data);
    }
  }
  return (
    <div className="relative flex flex-1 flex-col bg-black/50 p-4 min-w-[250px] min-h-[100px]">
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess && (
        <>
          <EnergyIcon type={type} />
          <div className="text-2xl font-extralight text-accentPink-500">
            <strong>{plan}</strong> {ENERGY_TYPE[type]}
          </div>
          <div className="font-digit text-6xl text-accentBlue-500 flex flex-col items-start gap-1">
            <div>
              {evenRound(cheapestRate, 2, true)}
              <span className="text-sm font-thin font-sans pl-1">p</span>
              <Badge
                label={`${
                  plan === "agile" ? "daily cheapest period" : "all day"
                }`}
              />
              <Comparison
                change={evenRound(
                  ((cheapestRate - priceCap[type]) / priceCap[type]) * 100
                )}
                compare="SVT cap"
              >
                <Remark variant="badge">
                  The{" "}
                  <a
                    href="https://www.ofgem.gov.uk/energy-price-cap"
                    target="_blank"
                  >
                    Ofgem Price Cap for standard variable tariff (SVT)
                  </a>{" "}
                  for this quarter is{" "}
                  <strong className="text-bold">{`${priceCap[type]}p`}</strong>{" "}
                  . This cap is reviewed every quarter. Please note that the
                  Ofgem caps are not applicable to Tracker tariffs which have a
                  much higher cap.
                </Remark>
              </Comparison>
            </div>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Badge label="monthly cheapest" variant="secondary" />
            -10p
          </div>
          <div className="absolute right-4 bottom-4">
            <Link href={`/${plan}`}>
              <span className="sr-only">more about Octopus {plan} plan</span>
              <BsArrowRightSquare
                className={`w-12 h-12 fill-white/30 ${
                  plan === "tracker"
                    ? "hover:fill-accentPink-600"
                    : "hover:fill-accentBlue-600"
                }`}
              />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default EnergyPriceCard;
