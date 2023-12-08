"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { QueryTariffResult, SVT_ETARIFF, TariffCategory } from "@/data/source";
import { maxIndex, mean, minIndex } from "d3";

import useTariffQuery from "../../hooks/useTariffQuery";

import { evenRound, formatLocaleTimePeriod } from "../../utils/helpers";

import ErrorMessage from "./ErrorMessage";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { PiSealWarningBold } from "react-icons/pi";
import { TbPigMoney } from "react-icons/tb";
import FormattedPrice from "./FormattedPrice";
import MonthlyChart from "./MonthlyChart";
import Lottie from "lottie-react";
import octopusIcon from "../../../public/lottie/octopus.json";
import useConsumptionCalculation from "@/hooks/useConsumptionCalculation";

import { HiOutlineCurrencyPound } from "react-icons/hi2";
import { TbMoneybag } from "react-icons/tb";

const SavingsChart = ({
  tariff,
  type,
  gsp,
  fromDate,
  compareTo,
  deviceNumber,
  serialNo,
}: {
  tariff: string;
  type: "E" | "G";
  gsp: string;
  fromDate: string;
  compareTo: TariffCategory;
  deviceNumber: string;
  serialNo: string;
}) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const toDate = today.toISOString();
  const category = "Tracker";

  const { cost } = useConsumptionCalculation({
    tariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
    results: "monthly",
  });

  const { cost: costSVT } = useConsumptionCalculation({
    tariff: SVT_ETARIFF,
    fromDate,
    toDate,
    type,
    category: "SVT",
    deviceNumber,
    serialNo,
    results: "monthly",
  });

  if (
    cost === null ||
    costSVT === null ||
    typeof cost === "number" ||
    typeof costSVT === "number"
  ) {
    return "Not available";
  }

  const [lastMonthCost, ...prevMonthCost] = cost;
  const [lastMonthCostSVT, ...prevMonthCostSVT] = costSVT;

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const priceAverage = mean(prevMonthCost, (d) => valueAccessor(d) ?? 0) ?? 0;

  const min = minIndex(prevMonthCost, (d) => valueAccessor(d) ?? 0);
  const max = maxIndex(prevMonthCost, (d) => valueAccessor(d) ?? 0);

  const priceAverageSVT =
    mean(prevMonthCostSVT, (d) => valueAccessor(d) ?? 0) ?? 0;

  const minSVT = minIndex(prevMonthCostSVT, (d) => valueAccessor(d) ?? 0);
  const maxSVTY = maxIndex(prevMonthCostSVT, (d) => valueAccessor(d) ?? 0);

  const totalSVT = costSVT.reduce((acc, cur) => acc + valueAccessor(cur), 0);
  const totalCost = cost.reduce((acc, cur) => acc + valueAccessor(cur), 0);

  const totalSaving = totalSVT - totalCost;

  return (
    <div
      className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
      }}
    >
      {cost.length > 0 ? (
        <>
          <div className="flex flex-1 flex-row justify-between gap-4 max-h-full overflow-hidden">
            <MonthlyChart
              cost={cost}
              costSVT={costSVT}
              priceAverage={priceAverage}
            />
            <div className="flex flex-col justify-between divide-y [&>div]:border-accentBlue-900">
              <div>
                <Badge
                  label="Total Charge"
                  icon={<TbMoneybag className="stroke-[#aaffdd]" />}
                  variant="secondary"
                />
                <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                  <FormattedPrice price={totalCost} value="pound" />
                  <div className="text-xs -translate-y-1">{`@ ${periodAccessor(
                    cost[cost.length - 1]
                  )} - ${periodAccessor(cost[0])}`}</div>
                </div>
              </div>
              <div>
                <Badge
                  label="Total SVT Charge"
                  icon={<TbMoneybag className="stroke-accentPink-500" />}
                  variant="secondary"
                />
                <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                  <FormattedPrice price={totalSVT} value="pound" />
                  <div className="text-xs -translate-y-1">{`@ ${periodAccessor(
                    cost[cost.length - 1]
                  )} - ${periodAccessor(cost[0])}`}</div>
                </div>
              </div>
              <div>
                <Badge
                  label="Total Saving"
                  icon={<HiOutlineCurrencyPound className="stroke-[#85cbf9]" />}
                  variant="secondary"
                />
                <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                  <FormattedPrice price={totalSaving} value="pound" />
                  <div className="text-xs">
                    <Comparison
                      change={evenRound(
                        ((totalCost - totalSVT) / totalSVT) * 100,
                        2
                      )}
                      compare="Variable Tariff"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Badge
                  label="Monthly Average"
                  icon={<LiaBalanceScaleSolid />}
                  variant="secondary"
                />
                <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                  <FormattedPrice price={priceAverage} value="pound" />
                  <div className="text-xs">
                    <Comparison
                      change={evenRound(
                        ((priceAverage - priceAverageSVT) / priceAverageSVT) *
                          100,
                        2
                      )}
                      compare="Variable Tariff"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex h-full items-center justify-center flex-col gap-2">
          <Lottie
            animationData={octopusIcon}
            aria-hidden={true}
            className="w-16 h-16"
          />
          <span className="text-sm font-light text-center">
            Octo is working hard to get data ready at around 4pm.
          </span>
        </div>
      )}
    </div>
  );
};

export default SavingsChart;
