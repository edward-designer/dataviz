"use client";

import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { ENERGY_TYPE, SVT_ETARIFF, TariffCategory } from "@/data/source";

import { toBlob, toJpeg } from "html-to-image";
import { saveAs } from "file-saver";

import { evenRound } from "../../utils/helpers";

import useConsumptionCalculation from "@/hooks/useConsumptionCalculation";
import Lottie from "lottie-react";
import octopusIcon from "../../../public/lottie/octopus.json";
import FormattedPrice from "./FormattedPrice";
import MonthlyChart from "./MonthlyChart";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbMoneybag, TbPigMoney } from "react-icons/tb";

import Image from "next/image";
import { useRef } from "react";
import logo from "../../../public/octoprice-light.svg";

import { RxShare2 } from "react-icons/rx";
import { PiDownloadSimple } from "react-icons/pi";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";

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
  const imageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const toDate = today.toISOString();
  const category = "Tracker";

  const { cost, totalUnit, totalPrice, totalStandingCharge } =
    useConsumptionCalculation({
      tariff,
      fromDate,
      toDate,
      type,
      category,
      deviceNumber,
      serialNo,
      results: "monthly",
    });

  const {
    cost: costSVT,
    totalPrice: totalPriceSVT,
    totalStandingCharge: totalStandingChargeSVT,
  } = useConsumptionCalculation({
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

  const valueAccessor = (d: { [x: string]: number }) => Object.values(d)[0];
  const periodAccessor = (d: { [x: string]: number }) => Object.keys(d)[0];

  const totalSVT = (totalPriceSVT + totalStandingChargeSVT) / 100;
  const totalCost = (totalPrice + totalStandingCharge) / 100;

  const totalSaving = totalSVT - totalCost;

  const unitRateAverage = totalPrice / totalUnit;
  const unitRateAverageSVT = totalPriceSVT / totalUnit;

  const canShare = "canShare" in navigator && navigator.canShare();

  const handleShare = async () => {
    if (!imageRef.current || !canShare) return;
    const newFile = await toBlob(imageRef.current);
    let data = {};
    if (newFile)
      data = {
        files: [
          new File([newFile], "octoprice.png", {
            type: newFile.type,
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
      if (!navigator.canShare(data)) {
        throw new Error("Sorry, cannot share at the moment.");
      }
      await navigator.share(data);
    } catch (err) {
      throw new Error("Sorry, cannot share at the moment.");
    }
  };

  const handleDownload = async () => {
    if (!imageRef.current) return;

    const fontCss = `@font-face {
  font-family: 'Advent Pro';
  font-style: normal;
  font-weight: 100;
  src: url(https://fonts.gstatic.com/s/adventpro/v23/V8mVoQfxVT4Dvddr_yOwrzaFxV7JtdQgFqXdUC4nMm4JHs1r.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`;

    const blob = await toBlob(imageRef.current, {
      preferredFontFormat: "ttf",
      fontEmbedCSS: fontCss,
    });
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
  };

  return (
    <>
      <div
        className="relative flex-1 flex flex-col gap-8 rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
        }}
      >
        {cost.length > 0 && costSVT.length ? (
          <>
            <div className="flex flex-1 flex-col md:flex-row justify-between gap-4 max-h-full overflow-hidden">
              <MonthlyChart cost={cost} costSVT={costSVT} />
              <div className="flex flex-col justify-between divide-y [&>div]:border-accentBlue-900 gap-1">
                <div className="flex flex-wrap justify-between items-start md:block text-[#85cbf9] bg-theme-900/30">
                  <Badge
                    label="Total Saving"
                    icon={<TbPigMoney className="stroke-[#85cbf9]" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
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

                <div className="flex flex-wrap justify-between items-start md:block text-[#aaffdd]">
                  <Badge
                    label="Average Unit Rate"
                    icon={<LiaBalanceScaleSolid className="fill-[#aaffdd]" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
                    <FormattedPrice price={unitRateAverage} value="pence" />
                    <div className="text-xs">
                      <Comparison
                        change={evenRound(
                          ((unitRateAverage - unitRateAverageSVT) /
                            unitRateAverageSVT) *
                            100,
                          2
                        )}
                        compare="Variable Tariff"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-start md:block text-white">
                  <Badge
                    label="Total Charge"
                    icon={<TbMoneybag className="stroke-white" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
                    <FormattedPrice price={totalCost} value="pound" />
                    <div className="text-xs -translate-y-1">{`@ ${periodAccessor(
                      cost[cost.length - 1]
                    )} - ${periodAccessor(cost[0])}`}</div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-start md:block text-accentPink-500">
                  <Badge
                    label="Total SVT Charge"
                    icon={<TbMoneybag className="stroke-accentPink-500" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl flex flex-col items-end justify-start">
                    <FormattedPrice price={totalSVT} value="pound" />
                    <div className="text-xs -translate-y-1">{`@ ${periodAccessor(
                      cost[cost.length - 1]
                    )} - ${periodAccessor(cost[0])}`}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <canvas ref={canvasRef} width="300" height="300"></canvas>

              <div
                ref={imageRef}
                className={`w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] bg-theme-950 rounded-2xl`}
              >
                <div
                  className={`${
                    type === "E"
                      ? "bg-[url(/images/octoprice-bg.jpg)]"
                      : "bg-[url(/images/octoprice-bg-gas.jpg)]"
                  } relative rounded-2xl border border-accentPink-500 font-display p-2 px-4 aspect-square w-[300px] h-[300px] bg-cover lg:scale-[2] lg:mb-[300px] origin-top-left`}
                >
                  <span className="absolute left-2 top-2">
                    {type === "E" && (
                      <BsLightningChargeFill className="fill-accentBlue-500/50 w-8 h-8" />
                    )}
                    {type === "G" && (
                      <AiFillFire className="fill-accentPink-500/50 w-8 h-8" />
                    )}
                  </span>
                  <Image
                    src={logo}
                    alt="Octoprice logo"
                    className="absolute top-2 right-2 w-20 h-auto "
                  />
                  <span className="block pt-16 text-accentPink-500 text-2xl m-0 p-0 leading-[1em]">
                    Octopus
                  </span>
                  <span className="block text-white text-5xl m-0 p-0 leading-[0.5em]">
                    saves
                    <span className="text-2xl text-accentBlue-500"> me</span>
                  </span>
                  <span className="block font-bold text-white text-8xl m-0 p-0 leading-[0.8em] ml-4 -translate-y-1">
                    <span className="text-3xl font-sans">£</span>
                    {evenRound(totalSaving, 0)}
                  </span>
                  <span className="block text-white text-xl m-0 p-0 -translate-y-3">
                    in{" "}
                    <span className="text-accentPink-500 text-3xl font-bold">
                      {ENERGY_TYPE[type]}
                    </span>{" "}
                    bill
                  </span>
                  <span className="block text-accentBlue-500 text-base m-0 p-0 -translate-y-5">
                    @{" "}
                    {`${periodAccessor(
                      cost[cost.length - 1]
                    )} - ${periodAccessor(cost[0])}`}
                  </span>
                  <span className="absolute font-sans bottom-2 right-2 text-xs">
                    https://octopriceuk.vercel.app
                  </span>
                </div>
              </div>
            </div>
            <button
              className="-translate-y-4 self-center flex justify-center items-center gap-2 border border-accentBlue-500 p-2 px-6 text-accentBlue-500 rounded-xl hover:bg-accentBlue-800 hover:text-white"
              onClick={canShare ? handleShare : handleDownload}
            >
              {canShare ? (
                <>
                  <RxShare2 /> Share
                </>
              ) : (
                <>
                  <PiDownloadSimple /> Download
                </>
              )}
            </button>
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

export default SavingsChart;
