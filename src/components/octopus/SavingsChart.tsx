"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import {
  ENERGY_TYPE,
  IPeriod,
  SVT_ETARIFF,
  TariffCategory,
} from "@/data/source";

import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

import { evenRound, getCategory } from "../../utils/helpers";

import useConsumptionCalculation from "@/hooks/useConsumptionCalculation";
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

const SavingsChart = ({
  tariff,
  type,
  gsp,
  fromDate,
  contractToDate,
  compareTo,
  deviceNumber,
  serialNo,
  selectedPeriod,
  dual = false,
}: {
  tariff: string;
  type: "E" | "G";
  gsp: string;
  fromDate: string;
  contractToDate?: undefined | string;
  compareTo: TariffCategory | string;
  deviceNumber: string;
  serialNo: string;
  selectedPeriod?: IPeriod;
  dual?: boolean;
}) => {
  const imageRef = useRef<HTMLDivElement | null>(null);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const toDate = contractToDate ?? today.toISOString();
  const category = getCategory(tariff);
  const compareToCategory =
    compareTo === "SVT" ? "SVT" : getCategory(compareTo);

  const {
    cost,
    totalUnit,
    totalPrice,
    totalStandingCharge,
    isLoading,
    lastDate,
    error,
  } = useConsumptionCalculation({
    tariff,
    fromDate: selectedPeriod ? selectedPeriod.from.toISOString() : fromDate,
    toDate: selectedPeriod ? selectedPeriod.to.toISOString() : toDate,
    type,
    category,
    deviceNumber,
    serialNo,
    results: "monthly",
    dual
  });

  const {
    cost: costSVT,
    totalPrice: totalPriceSVT,
    totalStandingCharge: totalStandingChargeSVT,
  } = useConsumptionCalculation({
    tariff: compareTo === "SVT" ? SVT_ETARIFF : compareTo,
    fromDate: selectedPeriod ? selectedPeriod.from.toISOString() : fromDate,
    toDate: selectedPeriod ? selectedPeriod.to.toISOString() : toDate,
    type,
    category: compareToCategory,
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
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-800 to-purple-600 bg-cover"
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
  if (
    cost === null ||
    costSVT === null ||
    typeof cost === "number" ||
    typeof costSVT === "number"
  ) {
    return;
  }

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const totalSVT = (totalPriceSVT + totalStandingChargeSVT) / 100;
  const totalCost = (totalPrice + totalStandingCharge) / 100;

  const totalSaving = totalSVT - totalCost;

  const unitRateAverage = totalPrice / totalUnit;
  const unitRateAverageSVT = totalPriceSVT / totalUnit;

  const canShare = "share" in navigator;

  const handleShare = async () => {
    if (!imageRef.current || !canShare) return;

    const canvas = await html2canvas(imageRef.current, {
      onclone: (el) => {
        const elementsWithShiftedDownwardText: NodeListOf<HTMLElement> =
          el.querySelectorAll(".shifted-text");
        elementsWithShiftedDownwardText.forEach((element) => {
          element.style.transform = "translateY(-25%)";
        });
      },
    });
    canvas.toBlob(async (blob) => {
      let data = {};
      if (blob) {
        data = {
          files: [
            new File([blob], "octoprice.png", {
              type: blob.type,
            }),
          ],
          title: `Octopus ${ENERGY_TYPE[type]} Bill Savings`,
          text: `Octopus saves me £${evenRound(
            totalSaving,
            0
          )} from ${periodAccessor(cost[cost.length - 1])} - ${periodAccessor(
            cost[0]
          )}`,
        };
        try {
          await navigator.share(data);
        } catch (err) {
          if (err instanceof Error) {
            if (!err.message.includes("cancellation of share"))
              console.log(err.message);
          }
        }
      }
    });
  };

  const handleDownload = async () => {
    if (!imageRef.current) return;

    const canvas = await html2canvas(imageRef.current, {
      onclone: (el) => {
        const elementsWithShiftedDownwardText: NodeListOf<HTMLElement> =
          el.querySelectorAll(".shifted-text");
        elementsWithShiftedDownwardText.forEach((element) => {
          element.style.transform = "translateY(-25%)";
        });
      },
    });
    canvas.toBlob((blob) => {
      try {
        if (blob) {
          if (window !== undefined && "saveAs" in window && window.saveAs) {
            window.saveAs(blob, `octoprice-${ENERGY_TYPE[type]}-saving.png`);
          } else {
            saveAs(blob, `octoprice-${ENERGY_TYPE[type]}-saving.png`);
          }
        } else {
          throw new Error("Sorry, cannot be downloaded at the moment.");
        }
      } catch (err) {
        throw new Error("Sorry, cannot be downloaded at the moment.");
      }
    });
  };

  return (
    <>
      <div
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-800 to-purple-600 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
        }}
      >
        {totalPrice > 0 ? (
          cost.length >= 1 && costSVT.length ? (
            <>
              <div className="flex flex-1 flex-col md:flex-row justify-between gap-4 max-h-full overflow-hidden">
                <MonthlyChart
                  cost={cost}
                  costSVT={costSVT}
                  lastDate={contractToDate ? null : lastDate}
                  type={type}
                  compare={compareToCategory}
                  tariff={tariff}
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
                      <FormattedPrice
                        price={Math.abs(totalSaving)}
                        value="pound"
                      />
                      <div className="text-xs">
                        <Comparison
                          change={evenRound(
                            ((totalCost - totalSVT) / totalSVT) * 100,
                            0
                          )}
                          compare={`${
                            compareToCategory === "Tracker"
                              ? "Old Tracker"
                              : "Variable Tariff"
                          }`}
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
                          compare={`${
                            compareToCategory === "Tracker"
                              ? "Old Tracker"
                              : "Variable Tariff"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex flex-wrap justify-between items-start md:block ${
                      compareToCategory === "Tracker"
                        ? "text-accentPink-500"
                        : "text-white"
                    }`}
                  >
                    <Badge
                      label={`${
                        compareToCategory === "Tracker"
                          ? "New Tracker"
                          : "Total Cost"
                      }`}
                      icon={
                        <TbMoneybag
                          className={`${
                            compareToCategory === "Tracker"
                              ? "stroke-accentPink-500"
                              : "stroke-white"
                          }`}
                        />
                      }
                      variant="item"
                    />
                    <div className="font-digit text-4xl flex flex-col items-end justify-start font-medium">
                      <FormattedPrice price={totalCost} value="pound" />
                      <div className="text-xs font-sans font-light -translate-y-1">{`@ ${periodAccessor(
                        cost[cost.length - 1]
                      )} - ${periodAccessor(cost[0])}`}</div>
                    </div>
                  </div>
                  <div
                    className={`flex flex-wrap justify-between items-start md:block ${
                      compareToCategory === "Tracker"
                        ? "text-white"
                        : "text-accentPink-500"
                    }`}
                  >
                    <Badge
                      label={`${
                        compareToCategory === "Tracker"
                          ? "Old Tracker"
                          : "Total SVT Cost"
                      }`}
                      icon={
                        <TbMoneybag
                          className={`${
                            compareToCategory === "Tracker"
                              ? "text-white"
                              : "text-accentPink-500"
                          }`}
                        />
                      }
                      variant="item"
                    />
                    <div className="font-digit text-4xl flex flex-col items-end justify-start">
                      <FormattedPrice price={totalSVT} value="pound" />
                      <div className="text-xs font-sans font-light -translate-y-1">{`@ ${periodAccessor(
                        cost[cost.length - 1]
                      )} - ${periodAccessor(cost[0])}`}</div>
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

export default SavingsChart;
