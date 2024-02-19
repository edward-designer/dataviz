"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { EnergyIcon } from "@/components/octopus/EnergyIcon";
import Remark from "@/components/octopus/Remark";
import { ENERGY_PLAN, ENERGY_TYPE, TariffType, gsp } from "@/data/source";
import useCheapestTariffQuery from "@/hooks/useCheapestTariffQuery";
import { evenRound } from "@/utils/helpers";
import Link from "next/link";
import { BsArrowRightSquare } from "react-icons/bs";

import ErrorMessage from "@/components/octopus/ErrorMessage";
import Loading from "@/components/Loading";
import { min } from "d3";
import useCurrentLocationPriceCapQuery from "@/hooks/useCurrentLocationPriceCapQuery";
import { UserContext } from "@/context/user";
import { useContext } from "react";
import { HiVizContext } from "@/context/hiViz";

export interface IEnergyPriceCard {
  type: Exclude<TariffType, "EG">;
  plan: ENERGY_PLAN;
}
type TariffRecord = {
  direct_debit_monthly: {
    standard_unit_rate_inc_vat: number;
  };
};
type CheapestTariffResult =
  | {
      tag: "tracker - E";
      single_register_electricity_tariffs: Record<gsp, TariffRecord>;
    }
  | {
      tag: "tracker - G";
      single_register_gas_tariffs: Record<gsp, TariffRecord>;
    }
  | {
      tag: "agile";
      results: {
        value_exc_vat: number;
        value_inc_vat: number;
        valid_from: string;
        valid_to: string;
      }[];
    };

const EnergyPriceCard = ({ type, plan }: IEnergyPriceCard) => {
  const { hiViz } = useContext(HiVizContext);
  const {
    value: { gsp },
  } = useContext(UserContext);
  const { data, isLoading, isError, isSuccess, error, refetch } =
    useCheapestTariffQuery<CheapestTariffResult>({
      plan,
      type,
      duration: "month",
    });

  const caps = useCurrentLocationPriceCapQuery({ gsp: `_${gsp}` as gsp });

  let cheapestRate: number = 0;
  if (isSuccess && data) {
    if (plan === "tracker") {
      const dataTracker = data[0];
      if (dataTracker.tag === "tracker - G") {
        const tariffRecords: TariffRecord[] = Object.values(
          dataTracker["single_register_gas_tariffs"]
        );
        cheapestRate = evenRound(
          min(
            tariffRecords,
            (d) => d["direct_debit_monthly"]["standard_unit_rate_inc_vat"]
          ) ?? 0,
          2
        );
      }
      if (dataTracker.tag === "tracker - E") {
        const tariffRecords: TariffRecord[] = Object.values(
          dataTracker["single_register_electricity_tariffs"]
        );
        cheapestRate = evenRound(
          min(
            tariffRecords,
            (d) => d["direct_debit_monthly"]["standard_unit_rate_inc_vat"]
          ) ?? 0,
          2
        );
      }
    }
    if (plan === "agile") {
      cheapestRate =
        min(data, (d) => {
          if (d.tag === "agile") {
            return min(d.results, (d) => d.value_inc_vat);
          }
          return 0;
        }) ?? 0;
    }
  }
  return (
    <div
      className={`${
        hiViz ? "bg-theme-950/80" : "bg-black/50"
      } relative flex flex-1 flex-col  p-4 min-w-[250px] min-h-[100px] backdrop-blur-sm lg:backdrop-blur-lg`}
    >
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess && caps && (
        <>
          <EnergyIcon type={type} />
          <div className="text-2xl font-extralight text-accentPink-500">
            <strong>{plan}</strong> {ENERGY_TYPE[type]}
          </div>
          <div>
            <Badge
              label={`${
                plan === "agile" ? "cheapest 1/2hr slot" : "cheapest daily"
              }`}
            />
          </div>
          <div className="font-digit text-6xl text-accentBlue-500 flex flex-col items-start gap-1">
            <div>
              {evenRound(cheapestRate, 2, true)}
              <span className="text-sm font-thin font-sans pl-1">p</span>

              <Remark variant="badge">
                The unit rate shown here is the lowest rate around UK. The
                actual unit rate depends on location and, in the case of Agile,
                the time of day.
              </Remark>
              <Comparison
                change={evenRound(
                  ((cheapestRate - Number(caps[type])) / Number(caps[type])) *
                    100
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
                  <strong className="text-bold">{`${evenRound(
                    Number(caps[type]),
                    2
                  )}p`}</strong>{" "}
                  . This cap is reviewed every quarter. Please note that the
                  Ofgem caps are not applicable to Tracker tariffs which have a
                  much higher cap.
                </Remark>
              </Comparison>
            </div>
          </div>
          <div className="flex gap-2 items-center mt-2">
            <Badge label="normal rate:" variant="secondary" />
            <span className="line-through">{`${evenRound(
              Number(caps[type]),
              2
            )}p`}</span>
          </div>
          <div className="absolute right-4 bottom-4">
            <Link href={`/${plan}`}>
              <span className="sr-only">more about Octopus {plan} plan</span>
              <BsArrowRightSquare
                className={`w-12 h-12 fill-white lg:fill-white/30 ${
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
