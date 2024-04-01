"use client";

import Badge from "@/components/octopus/Badge";

import { getCategory } from "../../utils/helpers";

import useConsumptionCalculation from "@/hooks/useConsumptionCalculation";
import Lottie from "lottie-react";
import octopusIcon from "../../../public/lottie/octopus.json";
import EarningMonthlyChart from "./EarningMonthlyChart";
import FormattedPrice from "./FormattedPrice";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { RiMoneyPoundCircleLine } from "react-icons/ri";

import { useRef } from "react";

import { PiQuestion } from "react-icons/pi";
import Loading from "../Loading";
import Remark from "./Remark";

const EarningChart = ({
  tariff,
  type,
  gsp,
  fromDate,
  contractToDate,
  deviceNumber,
  serialNo,
}: {
  tariff: string;
  type: "E" | "G";
  gsp: string;
  contractToDate?: string | undefined;
  fromDate: string;
  deviceNumber: string;
  serialNo: string;
}) => {
  const imageRef = useRef<HTMLDivElement | null>(null);

  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  today.setUTCDate(today.getUTCDate() - 1);
  const toDate = today.toISOString();
  const category = getCategory(tariff);
  console.log(fromDate);

  const {
    cost,
    units,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading,
    lastDate,
    error,
  } = useConsumptionCalculation({
    tariff,
    fromDate,
    toDate,
    type,
    category,
    deviceNumber,
    serialNo,
    results: "monthly",
  });

  if (isLoading)
    return (
      <div className="relative min-h-[300px]">
        <Loading />
      </div>
    );

  if (!isLoading && error) {
    return (
      <div
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
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
  }
  if (cost === null || typeof cost === "number") {
    return;
  }

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const totalCost = (totalPrice + totalStandingCharge) / 100;

  const unitRateAverage = totalUnit ? totalPrice / totalUnit : "--";

  return (
    <>
      <div
        className="relative mb-4 flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
        }}
      >
        {cost.length >= 1 ? (
          <>
            <div className="flex flex-1 flex-col md:flex-row justify-between gap-4 max-h-full overflow-hidden">
              <EarningMonthlyChart
                cost={cost}
                lastDate={contractToDate ? null : lastDate}
                type={type}
                units={units}
              />
              <div className="flex flex-col font-normal justify-start divide-y [&>div]:border-accentBlue-900 gap-3">
                <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
                  <Badge
                    label={`Total Earning`}
                    icon={<RiMoneyPoundCircleLine className="text-[#85cbf9]" />}
                    variant="item"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
                    <FormattedPrice price={totalCost} value="pound" />
                    <div className="text-xs"></div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-start md:block text-[#aaffdd]">
                  <Badge
                    label="Average Unit Rate"
                    icon={<LiaBalanceScaleSolid className="fill-[#aaffdd]" />}
                    variant="item"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
                    {typeof unitRateAverage === "number" ? (
                      <FormattedPrice price={unitRateAverage} value="pence" />
                    ) : (
                      unitRateAverage
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white/80 text-sm flex items-center gap-1">
              <PiQuestion className="fill-accentPink-500 w-6 h-6" />
              Why are the above results different from my Octopus bills?
              <Remark variant="badge">
                As we cannot get your bills directly from Octopus, we have
                applied approximations and assumptions in the calculations.
                Reasons for the differences may be missing data, rounding or, in
                the case of gas, the conversion of reading of gas volume to kWh
                (the unit used in our daily quote) because
                <strong>gas cost calculation is very complex.</strong> The unit
                of readings from smart meters differ depending on the generation
                of meter (i.e. SMETS1 meters have the consumption data
                pre-converted to kWh while SMETS2 meters transfer consumption
                data in the raw cubic meters which has to be converted to kWh
                based on a sophisticated formula.). If the calculated costs here
                deviate a lot from your actual charges on your bill, please
                click on your postcode on the top of the page to change the{" "}
                <strong>Gas Conversion Factor</strong>.
              </Remark>
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
              Octo is working hard to calculate your savings. Please re-visit
              this page later.
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default EarningChart;
