"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { ENERGY_TYPE, IMeterPointE, IPeriod, SVT_ETARIFF } from "@/data/source";

import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import { evenRound, getCategory } from "../../utils/helpers";

import Lottie from "lottie-react";
import chartIcon from "../../../public/lottie/chart.json";
import octopusIcon from "../../../public/lottie/octopus.json";
import FormattedPrice from "./FormattedPrice";
import MonthlyChart from "./MonthlyChart";

import { GrMoney } from "react-icons/gr";
import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbMoneybag, TbPigMoney } from "react-icons/tb";

import { useRef } from "react";

import { PiQuestion } from "react-icons/pi";
import Loading from "../Loading";
import Remark from "./Remark";

import useDailyAmountCalculation from "@/hooks/useDailyAmountCalculation";

const getPeriodArray = (fromDate: Date, toDate: Date) => {
  const diffInDays = Math.round(
    (toDate.valueOf() - fromDate.valueOf()) / (1000 * 60 * 60 * 24)
  );
  return Array.from({ length: diffInDays }).map(
    (_, i) =>
      new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + i))
  );
};

const SavingsChartDaily = ({
  type,
  gsp,
  deviceNumber,
  serialNo,
  period,
  agreements,
  compareTo,
  apiKey,
}: {
  type: "E" | "G";
  gsp: string;
  deviceNumber: string;
  serialNo: string;
  period: IPeriod;
  agreements: IMeterPointE["agreements"];
  compareTo: string;
  apiKey: string;
}) => {
  const fromDate = period.from;
  const toDate = period.to;
  const periodArray = getPeriodArray(fromDate, toDate);
  const periodWithTariff = periodArray.map((date, i) => {
    let tariff = "";
    agreements.forEach((agreement) => {
      if (
        new Date(agreement.valid_from).valueOf() <= date.valueOf() &&
        new Date(agreement.valid_to).valueOf() >= date.valueOf()
      ) {
        tariff = agreement.tariff_code.slice(5, -2);
      }
    });
    return { date, tariff };
  });

  const periodDailyAmountCalculation = useDailyAmountCalculation({
    type,
    periodWithTariff,
    deviceNumber,
    serialNo,
    gsp,
    compareTo,
    apiKey,
  });

  console.log(periodDailyAmountCalculation);
  
  const isLoading = false;
  const error = false;

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

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  /* const totalSVT = (totalPriceSVT + totalStandingChargeSVT) / 100;
  const totalCost = (totalPrice + totalStandingCharge) / 100;

  const totalSaving = totalSVT - totalCost;

  const unitRateAverage = totalPrice / totalUnit;
  const unitRateAverageSVT = totalPriceSVT / totalUnit;

  const canShare = "share" in navigator;
*/

  return (
    <>
      <div
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
        }}
      >
        {true ? (
          true ? (
            <>
              <div className="text-white/80 text-sm flex items-center gap-1">
                <PiQuestion className="fill-accentPink-500 w-6 h-6" />
                Why are the above results different from my Octopus bills?
                <Remark variant="badge">
                  As we cannot get your bills directly from Octopus, we have
                  applied approximations and assumptions in the calculations.
                  Reasons for the differences may be missing data, rounding or,
                  in the case of gas, the conversion of reading of gas volume to
                  kWh (the unit used in our daily quote) because{" "}
                  <strong>gas cost calculation is very complex.</strong> The
                  unit of readings from smart meters differ depending on the
                  generation of meter (i.e. SMETS1 meters have the consumption
                  data pre-converted to kWh while SMETS2 meters transfer
                  consumption data in the raw cubic meters which has to be
                  converted to kWh based on a sophisticated formula.). If the
                  calculated costs here deviate a lot from your actual charges
                  on your bill, please click on your postcode on the top of the
                  page to change the <strong>Gas Conversion Factor</strong>.
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
          )
        ) : (
          <div className="flex-1 flex h-full items-center justify-center flex-col gap-2">
            <Lottie
              animationData={chartIcon}
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

export default SavingsChartDaily;
