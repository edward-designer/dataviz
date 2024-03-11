"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { IMeterPointE, IPeriod } from "@/data/source";

import { evenRound } from "../../utils/helpers";

import Lottie from "lottie-react";
import octopusIcon from "../../../public/lottie/octopus.json";
import FormattedPrice from "./FormattedPrice";

import { GrMoney } from "react-icons/gr";
import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbMoneybag, TbPigMoney } from "react-icons/tb";

import { PiQuestion } from "react-icons/pi";
import Loading from "../Loading";
import Remark from "./Remark";

import useDailyAmountCalculation from "@/hooks/useDailyAmountCalculation";
import DailyChart from "./DailyChart";

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
  const latestDate = new Date();
  latestDate.setHours(23, 59, 59, 999);
  latestDate.setDate(latestDate.getDate() - 1);

  const fromDate = period.from;
  const toDate =
    period.to.valueOf() > latestDate.valueOf() ? latestDate : period.to;
  const periodArray = getPeriodArray(fromDate, toDate);
  const periodWithTariff = periodArray.map((date, i) => {
    let tariff = "";
    agreements.forEach((agreement) => {
      if (
        new Date(agreement.valid_from).valueOf() <= date.valueOf() &&
        (new Date(agreement.valid_to).valueOf() >= date.valueOf() ||
          agreement.valid_to === null)
      ) {
        tariff = agreement.tariff_code.slice(5, -2);
      }
    });
    return { date, tariff };
  });

  console.log(periodWithTariff);

  const { isLoading, isSuccess, results } = useDailyAmountCalculation({
    type,
    periodWithTariff,
    deviceNumber,
    serialNo,
    gsp,
    compareTo,
    apiKey,
  });

  if (isLoading)
    return (
      <div className="relative min-h-[300px]">
        <Loading />
      </div>
    );

  if (!results) {
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
          <span className="text-sm font-light text-center">
            Sorry, we have some issues here. Please check back later.
          </span>
        </div>
      </div>
    );
  }

  const totalPriceSVT = results.reduce((acc, cur) => cur.SVTcost + acc, 0);
  const totalStandingChargeSVT = results.reduce(
    (acc, cur) => cur.SVTstandingCharge + acc,
    0
  );
  const totalPrice = results.reduce((acc, cur) => cur.cost + acc, 0);
  const totalStandingCharge = results.reduce(
    (acc, cur) => cur.standingCharge + acc,
    0
  );
  const totalUnit = results.reduce((acc, cur) => cur.reading + acc, 0);

  const totalSVT = (totalPriceSVT + totalStandingChargeSVT) / 100;
  const totalCost = (totalPrice + totalStandingCharge) / 100;
  const totalSaving = totalSVT - totalCost;
  const unitRateAverage = totalPrice / totalUnit;
  const unitRateAverageSVT = totalPriceSVT / totalUnit;

  return (
    <>
      <div
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
        }}
      >
        <div className="flex flex-col flex-1 text-white/80 text-sm">
          <div className="flex flex-1 flex-col md:flex-row justify-between gap-4 max-h-full overflow-hidden mb-8">
            <DailyChart
              data={results}
              type={type}
              month={fromDate.toLocaleDateString("en-GB", { month: "short" })}
            />
            <div className="flex flex-col font-normal justify-start divide-y [&>div]:border-accentBlue-900 gap-3">
              <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
                <Badge
                  label={`Total ${
                    totalCost - totalSVT < 0 ? `Saving` : `Increase`
                  }`}
                  icon={
                    totalCost - totalSVT < 0 ? (
                      <TbPigMoney className="stroke-[#85cbf9]" />
                    ) : (
                      <GrMoney className="stroke-[#85cbf9]" />
                    )
                  }
                  variant="item"
                />
                <div className="font-digit text-4xl flex flex-col items-end justify-start">
                  <FormattedPrice price={Math.abs(totalSaving)} value="pound" />
                  <div className="text-xs">
                    <Comparison
                      change={evenRound(
                        ((totalCost - totalSVT) / totalSVT) * 100,
                        0
                      )}
                      compare={`Variable Tariff`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-start md:block text-[#aaffdd]">
                <Badge
                  label="Average Unit Rate"
                  icon={<LiaBalanceScaleSolid className="fill-[#aaffdd]" />}
                  variant="item"
                />
                <div className="font-digit text-4xl flex flex-col items-end justify-start">
                  <FormattedPrice price={unitRateAverage} value="pence" />
                  <div className="text-xs">
                    <Comparison
                      change={evenRound(
                        ((unitRateAverage - unitRateAverageSVT) /
                          unitRateAverageSVT) *
                          100,
                        0
                      )}
                      compare={`Variable Tariff`}
                    />
                  </div>
                </div>
              </div>
              <div
                className={`flex flex-wrap justify-between items-start md:block text-white`}
              >
                <Badge
                  label={`Total Cost`}
                  icon={<TbMoneybag className="stroke-white" />}
                  variant="item"
                />
                <div className="font-digit text-4xl flex flex-col items-end justify-start font-medium">
                  <FormattedPrice price={totalCost} value="pound" />
                </div>
              </div>
              <div
                className={`flex flex-wrap justify-between items-start md:block text-accentPink-500`}
              >
                <Badge
                  label={`Total SVT Cost`}
                  icon={<TbMoneybag className="text-accentPink-500" />}
                  variant="item"
                />
                <div className="font-digit text-4xl flex flex-col items-end justify-start">
                  <FormattedPrice price={totalSVT} value="pound" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-white/80 text-sm flex items-center gap-1">
            <PiQuestion className="fill-accentPink-500 w-6 h-6" />
            Why are the above results different from my Octopus bills?
            <Remark variant="badge">
              As we cannot get your bills directly from Octopus, we have applied
              approximations and assumptions in the calculations. Reasons for
              the differences may be missing data, rounding or, in the case of
              gas, the conversion of reading of gas volume to kWh (the unit used
              in our daily quote) because{" "}
              <strong>gas cost calculation is very complex.</strong> The unit of
              readings from smart meters differ depending on the generation of
              meter (i.e. SMETS1 meters have the consumption data pre-converted
              to kWh while SMETS2 meters transfer consumption data in the raw
              cubic meters which has to be converted to kWh based on a
              sophisticated formula.). If the calculated costs here deviate a
              lot from your actual charges on your bill, please click on your
              postcode on the top of the page to change the{" "}
              <strong>Gas Conversion Factor</strong>.
            </Remark>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavingsChartDaily;
