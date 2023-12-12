"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import Remark from "./Remark";

import {
  CapsTSVResult,
  ENERGY_TYPE,
  QueryTariffResult,
  TariffResult,
  TariffType,
  gsp,
} from "@/data/source";

import useTariffQuery from "../../hooks/useTariffQuery";

import {
  calculateChangePercentage,
  evenRound,
  isSameDate,
  isToday,
  priceAccessor,
} from "../../utils/helpers";

import backgroundE from "../../../public/images/E.jpg";
import backgroundG from "../../../public/images/G.jpg";
import ErrorMessage from "./ErrorMessage";
import { EnergyIcon } from "./EnergyIcon";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { WindowVisibilityContext } from "@/context/windowVisibility";
import { LastShownContext } from "@/context/lastShownDates";
import useCurrentLocationPriceCapQuery from "@/hooks/useCurrentLocationPriceCapQuery";

const PricePane = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
}) => {
  const { isLoading, isError, isSuccess, isRefetching, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
    });
  const {
    lastShownDate: { [type]: lastShownDate },
    setLastShownDate,
  } = useContext(LastShownContext);

  const todayDate = new Date().toLocaleDateString();
  const results = data?.[0]?.results ?? [];

  const priceTodayIndex = results.findIndex((data) =>
    isToday(new Date(data.valid_from))
  );
  const priceYesterdayIndex = results.findIndex((data) =>
    isSameDate(
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(data.valid_from)
    )
  );

  const caps = useCurrentLocationPriceCapQuery({
    gsp: `_${gsp}` as gsp,
  });

  const noPriceTomorrowMessage =
    "The rate of tomorrow is usually available between 11.00am and 6.00pm. Please revisit this page later to get the updates.";

  const [priceYesterdayDisplay] = getPriceDisplay({
    priceTodayIndex,
    priceYesterdayIndex,
    priceDisplayDate: "yesterday",
    priceCap: caps,
    results,
    type,
  });
  const [priceTodayDisplay, priceChangeToday] = getPriceDisplay({
    priceTodayIndex,
    priceYesterdayIndex,
    priceDisplayDate: "today",
    priceCap: caps,
    results,
    type,
  });
  const [_, priceChangeTodayVsPriceCap] = getPriceDisplay({
    priceTodayIndex,
    priceYesterdayIndex,
    priceDisplayDate: "todayVsPriceCap",
    priceCap: caps,
    results,
    type,
  });
  const [priceTomorrowDisplay, priceChangeTomorrow, priceTomorrow] =
    getPriceDisplay({
      priceTodayIndex,
      priceYesterdayIndex,
      priceDisplayDate: "tomorrow",
      priceCap: caps,
      results,
      type,
      message: noPriceTomorrowMessage,
    });

  useEffect(() => {
    if (
      priceTomorrow !== "--" &&
      new Date().toLocaleDateString() !== lastShownDate
    ) {
      toast(
        `Update: ${ENERGY_TYPE[type]} rate tomorrow is ${priceTomorrow}p (${
          Number(priceChangeTomorrow) >= 0 ? "+" : ""
        }${priceChangeTomorrow}%)`,
        {
          icon: Number(priceChangeTomorrow) >= 0 ? "🤨" : "🥳",
        }
      );
      setLastShownDate((value) => ({
        ...value,
        [type]: new Date().toLocaleDateString(),
      }));
    }
  }, [
    priceChangeTomorrow,
    priceTomorrow,
    type,
    todayDate,
    lastShownDate,
    setLastShownDate,
  ]);

  return (
    <div className="pricePane relative flex-1">
      <div
        className="flex flex-col gap-8 p-4 min-h-[250px] md:min-h-[300px] rounded-xl bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% ),url(${
            type === "E" ? backgroundE.src : backgroundG.src
          })`,
        }}
      >
        {(isLoading || isRefetching) && <Loading />}
        {isError && (
          <ErrorMessage error={error} errorHandler={() => refetch()} />
        )}
        {isSuccess && (
          <>
            <EnergyIcon type={type} />
            <div className="flex flex-1 self-start flex-col">
              <Badge
                label={`Today @ ${new Date().toLocaleString()}`}
                variant="secondary"
              />
              <div className="font-digit text-6xl text-white flex flex-col items-start gap-1">
                <div>{priceTodayDisplay}</div>
                <div className="flex">
                  {typeof priceChangeToday === "number" && (
                    <Comparison change={priceChangeToday} compare="yesterday" />
                  )}
                  {typeof priceChangeTodayVsPriceCap === "number" && (
                    <Comparison
                      change={priceChangeTodayVsPriceCap}
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
                        <strong className="text-bold">
                          {`${caps[type]}p`}
                        </strong>{" "}
                        . This cap is reviewed every quarter. Please note that
                        the Ofgem caps are not applicable to Tracker tariffs
                        which have a much higher cap.
                      </Remark>
                    </Comparison>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex justify-center items-start flex-col">
                <Badge label="Yesterday" variant="secondary" />
                <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                  {priceYesterdayDisplay}
                </div>
              </div>

              <div className="flex justify-center items-start flex-col">
                <Badge label="Tomorrow" variant="secondary" />
                <div className="font-digit text-center text-3xl text-white flex justify-center items-end">
                  {priceTomorrowDisplay}
                  {typeof priceChangeTomorrow === "number" && (
                    <Comparison change={priceChangeTomorrow} compare="today" />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricePane;

interface IGetPriceDisplay {
  priceTodayIndex: number | undefined;
  priceYesterdayIndex: number | undefined;
  priceDisplayDate: "today" | "yesterday" | "tomorrow" | "todayVsPriceCap";
  priceCap: CapsTSVResult;
  results: TariffResult[];
  type: Exclude<TariffType, "EG">;
  message?: string;
}

const getPriceDisplay = ({
  priceTodayIndex,
  priceYesterdayIndex,
  priceDisplayDate,
  priceCap,
  results,
  type,
  message = "Sorry, the price is currently unavailable, please check back later.",
}: IGetPriceDisplay) => {
  let display = (
    <>
      --
      <Remark>{message}</Remark>
    </>
  );
  let changeVsPrevDay: boolean | number = false;
  let price: string | number = "--";
  let priceToCompare: string | number = "--";

  if (
    priceTodayIndex !== undefined &&
    priceYesterdayIndex !== undefined &&
    priceYesterdayIndex !== 0
  ) {
    const indexToAccessMap = {
      yesterday: priceYesterdayIndex,
      today: priceTodayIndex,
      tomorrow: priceTodayIndex - 1,
      todayVsPriceCap: priceTodayIndex,
    };
    const comparePriceMap = {
      yesterday: null,
      today: priceAccessor(results, priceYesterdayIndex),
      tomorrow: priceAccessor(results, priceTodayIndex),
      todayVsPriceCap: Number(priceCap?.[type] ?? 0),
    };
    const indexToAccess = indexToAccessMap[priceDisplayDate];

    if (typeof indexToAccess === "number" && indexToAccess >= 0)
      price = priceAccessor(results, indexToAccess) ?? "--";
    const priceToCompare = comparePriceMap[priceDisplayDate];

    changeVsPrevDay = calculateChangePercentage(price, priceToCompare);

    if (typeof price === "number")
      display = (
        <>
          {evenRound(price, 2, true)}
          <span className="text-sm font-thin font-sans pl-1">p</span>
        </>
      );
  }

  return [display, changeVsPrevDay, price] as const;
};
