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
  getTariffName,
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
import PricePaneAgile2 from "./PricePaneAgile2";
import HalfHourlyChart from "./HalfHourlyChart";
import { max, maxIndex, mean, min, minIndex } from "d3";

const PricePane = ({
  tariff,
  type,
  gsp,
  standingCharge,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
  standingCharge: number;
}) => {
  const { isLoading, isError, isSuccess, isRefetching, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
      duration: "2-days",
    });
  const tariffName = getTariffName(tariff);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(new Date().setDate(new Date().getDate() + 1));
  todayEnd.setHours(0, 0, 0, 0);
  const results =
    data?.[0]?.results.filter((result) =>
      tariffName === "Agile" || tariffName === "Flux" || tariffName === "Go"
        ? !(
            Date.parse(result.valid_to) <= todayStart.valueOf() ||
            Date.parse(result.valid_from) >= todayEnd.valueOf()
          )
        : !(Date.parse(result.valid_to) <= todayStart.valueOf())
    ) ?? [];

  if (tariffName === "Flux" || tariffName === "Go") {
    results.forEach((result, i) => {
      if (Date.parse(result.valid_from) < todayStart.valueOf())
        results[i].valid_from = todayStart.toISOString();
      if (Date.parse(result.valid_to) > todayEnd.valueOf())
        results[i].valid_to = todayEnd.toISOString();
    });
  }
  const singleTariff = ["Variable", "Tracker", "Fixed"].includes(tariffName);

  const priceTodayIndex = ["Tracker"].includes(tariffName)
    ? results.findIndex((data) => isToday(new Date(data.valid_from)))
    : results.findIndex(
        (data) =>
          Date.parse(data.valid_from) <= new Date().valueOf() &&
          (data.valid_to === null ||
            Date.parse(data.valid_to) > new Date().valueOf())
      );
  console.log(priceTodayIndex);
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

  const [priceTodayDisplay, priceChangeToday] = getPriceDisplay({
    priceTodayIndex,
    priceYesterdayIndex,
    priceDisplayDate: "today",
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

  const priceAverage = mean(results, (d) => d.value_inc_vat) ?? 0;
  const priceMin = min(results, (d) => d.value_inc_vat) ?? 0;
  const priceMax = max(results, (d) => d.value_inc_vat) ?? 0;
  const priceMinIndex = minIndex(results, (d) => d.value_inc_vat);
  const priceMaxIndex = maxIndex(results, (d) => d.value_inc_vat);

  return (
    <div className="pricePane relative flex-1">
      <div
        className="flex flex-col gap-4 p-4 min-h-[250px] md:min-h-[250px] rounded-xl bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
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
            <div className="flex flex-1 self-stretch flex-col w-full">
              <Badge
                label={
                  singleTariff ? "Today's Unit Rate" : "Today's Unit Rates"
                }
                variant="secondary"
              />
              <div className="font-digit text-6xl text-white flex flex-col items-start gap-1 w-full">
                {singleTariff ? (
                  <>
                    <div className="">{priceTodayDisplay}</div>
                  </>
                ) : ["Agile", "Flux", "Go"].includes(tariffName) ? (
                  <div className="relative flex-1 flex flex-col max-h-[180px] min-h-[180px] rounded-xl w-full mt-3">
                    <div className="w-full flex flex-1 flex-row justify-between gap-4 max-h-full overflow-hidden">
                      <HalfHourlyChart
                        rates={results}
                        min={priceMinIndex}
                        max={priceMaxIndex}
                        priceAverage={priceAverage}
                        showTicker={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row gap-x-6 gap-y-2 flex-wrap mt-3">
                    {results
                      .filter(
                        (result) =>
                          Date.parse(result.valid_from) <= todayEnd.valueOf()
                      )
                      .reverse()
                      .map((result, i) => (
                        <div
                          key={i}
                          className="flex flex-col border-l-4 border-l-accentBlue-800 pl-2"
                        >
                          <span className="text-xs leading-none">
                            {new Date(result.valid_from) < todayStart
                              ? "00:00"
                              : new Date(result.valid_from).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                            {` - `}
                            {result.valid_to === null ||
                            new Date(result.valid_to) > todayEnd
                              ? "24:00"
                              : new Date(result.valid_to).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                          </span>
                          <span className="text-4xl">
                            {evenRound(result.value_inc_vat, 2, true)}
                            <span className="text-sm font-thin font-sans pl-1">
                              p
                            </span>
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-start flex-wrap">
              <div className="flex justify-center items-start flex-col">
                <Badge label="Standing Charge" variant="secondary" />
                <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                  {evenRound(standingCharge, 2, true)}
                  <span className="text-sm font-thin font-sans pl-1">p</span>
                </div>
              </div>
              {(tariffName === "Agile" || tariffName === "Flux") && (
                <>
                  <div className="flex justify-center items-start flex-col border-l-4 border-l-accentBlue-700 pl-2">
                    <Badge label="Lowest" variant="secondary" />
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(priceMin, 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-start flex-col border-l-4 border-l-accentBlue-700 pl-2">
                    <Badge label="Average" variant="secondary" />
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(priceAverage, 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center items-start flex-col border-l-4 border-l-accentBlue-700 pl-2">
                    <Badge label="Highest" variant="secondary" />
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(priceMax, 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                    </div>
                  </div>
                </>
              )}
              {tariffName === "Tracker" && (
                <div className="flex justify-center items-start flex-col">
                  <Badge label="Tomorrow" variant="secondary" />
                  <div className="font-digit text-center text-3xl text-white flex justify-center items-end">
                    {priceTomorrowDisplay}
                  </div>
                </div>
              )}
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
