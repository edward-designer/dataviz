"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import { QueryTariffResult } from "@/data/source";
import { maxIndex, mean, minIndex } from "d3";

import useTariffQuery from "../../hooks/useTariffQuery";

import { evenRound, formatLocaleTimePeriod } from "../../utils/helpers";

import ErrorMessage from "./ErrorMessage";

import { LiaBalanceScaleSolid } from "react-icons/lia";
import { PiSealWarningBold } from "react-icons/pi";
import { TbPigMoney } from "react-icons/tb";
import { FaFrownOpen } from "react-icons/fa";
import { FaSmile } from "react-icons/fa";

import FormattedPrice from "./FormattedPrice";
import HalfHourlyChart from "./HalfHourlyChart";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import Lottie from "lottie-react";

import octopusIcon from "../../../public/lottie/octopus.json";
import { useEffect, useState } from "react";

const PricePane = ({
  tariff,
  type,
  gsp,
  date = new Date().toDateString(),
  isExport = false,
  maximize = false,
}: {
  tariff: string;
  type: "E";
  gsp: string;
  date?: string;
  isExport?: boolean;
  maximize?: boolean;
}) => {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toDateString()
  );
  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
    });
  let isToday = new Date(date).toDateString() === new Date().toDateString();
  const results = data?.[0]?.results ?? [];

  if (Number.isNaN(new Date(date))) {
    date = new Date().toDateString();
    isToday = true;
  }
  const thisDayStart = new Date(date);
  thisDayStart.setHours(0, 0, 0, 0);
  const thisDayEnd = new Date(
    new Date(date).setDate(new Date(date).getDate() + 1)
  );
  thisDayEnd.setHours(0, 0, 0, 0);

  const thisDayRatesRaw = results.filter((data) => {
    return (
      new Date(data.valid_to) > thisDayStart &&
      new Date(data.valid_from) < thisDayEnd
    );
  });

  // change valid_from / valid_to within the day
  const thisDayRates = thisDayRatesRaw.map((data) => {
    if (new Date(data.valid_from) < thisDayStart)
      return { ...data, valid_from: thisDayStart.toISOString() };
    if (new Date(data.valid_to) > thisDayEnd)
      return { ...data, valid_to: thisDayEnd.toISOString() };
    return data;
  });

  const previousDayRates = results.filter((data) => {
    const previousDayStart = new Date(
      new Date(date).setDate(new Date(date).getDate() - 1)
    );
    previousDayStart.setHours(0, 0, 0, 0);
    const previousDayEnd = new Date(
      new Date(date).setDate(new Date(date).getDate() - 1)
    );
    previousDayEnd.setHours(23, 59, 59, 999);
    return (
      new Date(data.valid_from) >= previousDayStart &&
      new Date(data.valid_from) <= previousDayEnd
    );
  });

  const priceAverage = mean(thisDayRates, (d) => d.value_inc_vat) ?? 0;
  const previousDayPriceAverage =
    mean(previousDayRates, (d) => d.value_inc_vat) ?? 0;
  const min = minIndex(thisDayRates, (d) => d.value_inc_vat);
  const max = maxIndex(thisDayRates, (d) => d.value_inc_vat);

  useEffect(() => {
    const timeAt4pm = new Date();
    timeAt4pm.setHours(16, 1, 0, 0);
    const timeTo4pm = timeAt4pm.getTime() - new Date().getTime();

    if (thisDayRates.length === 0 && typeof window !== undefined) {
      const refetchTime = timeTo4pm > 0 ? timeTo4pm : 60000;
      let intervalId: null | number = null;
      const timeID = window.setTimeout(() => {
        intervalId = window.setInterval(() => {
          refetch();
        }, 60000);
      }, refetchTime);
      return () => {
        window.clearTimeout(timeID);
        if (intervalId !== null) {
          window.clearInterval(intervalId);
        }
      };
    }
  });

  useEffect(() => {
    const timeToNextDay = thisDayEnd.getTime() + 1000;
    const timeID = window.setTimeout(() => {
      setCurrentDate(thisDayEnd.toDateString());
    }, timeToNextDay);
    return () => {
      window.clearTimeout(timeID);
    };
  });

  return (
    <div
      className={`${
        maximize ? "h-[calc(100vh-3rem)]" : "h-[300px]"
      } relative flex-1 flex flex-col gap-8 min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-900 to-purple-950 bg-cover`}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
      }}
    >
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess &&
        (thisDayRates.length > 0 ? (
          <>
            <div className="flex flex-1 flex-row justify-between gap-4 max-h-full overflow-hidden">
              <HalfHourlyChart
                rates={thisDayRates}
                min={min}
                max={max}
                priceAverage={priceAverage}
                showTicker={isToday}
                maximize={maximize}
              />
              <div
                className={`${
                  maximize ? "justify-start" : "justify-between"
                } flex flex-col  divide-y [&>div]:border-accentBlue-900`}
              >
                <div>
                  <Badge
                    label="Lowest"
                    icon={
                      !isExport ? (
                        <TbPigMoney className="stroke-[#aaffdd]" />
                      ) : (
                        <FaFrownOpen className="fill-[#aaffdd]" />
                      )
                    }
                    variant="item"
                  />
                  <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                    <FormattedPrice price={thisDayRates[min].value_inc_vat} />
                    <div className="text-xs -translate-y-1">{`@ ${formatLocaleTimePeriod(
                      thisDayRates[min].valid_from,
                      thisDayRates[min].valid_to
                    )}`}</div>
                  </div>
                </div>
                <div>
                  <Badge
                    label="Highest"
                    icon={
                      !isExport ? (
                        <PiSealWarningBold className="fill-accentPink-500" />
                      ) : (
                        <FaSmile className="fill-accentPink-500" />
                      )
                    }
                    variant="item"
                  />
                  <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                    <FormattedPrice price={thisDayRates[max].value_inc_vat} />
                    <div className="text-xs -translate-y-1">{`@ ${formatLocaleTimePeriod(
                      thisDayRates[max].valid_from,
                      thisDayRates[max].valid_to
                    )}`}</div>
                  </div>
                </div>
                <div>
                  <Badge
                    label="Average"
                    icon={<LiaBalanceScaleSolid />}
                    variant="item"
                  />
                  <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                    <FormattedPrice price={priceAverage} />
                    <div className="text-xs">
                      <Comparison
                        change={evenRound(
                          priceAverage - previousDayPriceAverage,
                          2
                        )}
                        compare="previous day"
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
        ))}
    </div>
  );
};

export default PricePane;
