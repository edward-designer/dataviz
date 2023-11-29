"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import Remark from "./Remark";
import {
  extent,
  maxIndex,
  mean,
  minIndex,
  scaleDiverging,
  scaleSqrt,
} from "d3";
import {
  QueryTariffResult,
  TariffResult,
  TariffType,
  priceCap,
} from "@/data/source";

import useTariffQuery from "../../hooks/useTariffQuery";

import {
  calculateChangePercentage,
  evenRound,
  formatLocaleTimePeriod,
  isSameDate,
  isToday,
  priceAccessor,
} from "../../utils/helpers";

import backgroundE from "../../../public/images/E.jpg";
import ErrorMessage from "./ErrorMessage";
import { EnergyIcon } from "./EnergyIcon";
import Timer from "./Timer";

import { BiArrowToBottom } from "react-icons/bi";
import { BiArrowFromBottom } from "react-icons/bi";
import { LiaBalanceScaleSolid } from "react-icons/lia";
import { TbPigMoney } from "react-icons/tb";
import { PiSealWarningBold } from "react-icons/pi";
import { useEffect } from "react";
import FormattedPrice from "./FormattedPrice";
import HalfHourlyChart from "./HalfHourlyChart";

import octopusIcon from "../../../public/lottie/octopus.json";
import Lottie from "lottie-react";

const PricePane = ({
  tariff,
  type,
  gsp,
  date = new Date().toDateString(),
}: {
  tariff: string;
  type: "E";
  gsp: string;
  date?: string;
}) => {
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

  const thisDayRates = results.filter((data) => {
    const thisDayStart = new Date(date);
    thisDayStart.setHours(0, 0, 0, 0);
    const thisDayEnd = new Date(date);
    thisDayEnd.setHours(23, 59, 59, 999);
    return (
      new Date(data.valid_from) >= thisDayStart &&
      new Date(data.valid_from) <= thisDayEnd
    );
  });

  const previousDayRates = results.filter((data) => {
    const previousDayStart = new Date(
      new Date().setDate(new Date().getDate() - 1)
    );
    previousDayStart.setHours(0, 0, 0, 0);
    const previousDayEnd = new Date(
      new Date().setDate(new Date().getDate() - 1)
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

  return (
    <div
      className="relative flex-1 flex flex-col gap-8 max-h-[300px] min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
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
              />
              <div className="flex flex-col justify-between divide-y [&>div]:border-accentBlue-900">
                <div>
                  <Badge
                    label="Lowest"
                    icon={<TbPigMoney className="stroke-accentBlue-500" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                    <FormattedPrice price={thisDayRates[min].value_inc_vat} />
                    <div className="text-xs">{`@ ${formatLocaleTimePeriod(
                      thisDayRates[min].valid_from,
                      thisDayRates[min].valid_to
                    )}`}</div>
                  </div>
                </div>
                <div>
                  <Badge
                    label="Highest"
                    icon={<PiSealWarningBold className="fill-accentPink-500" />}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                    <FormattedPrice price={thisDayRates[max].value_inc_vat} />
                    <div className="text-xs">{`@ ${formatLocaleTimePeriod(
                      thisDayRates[max].valid_from,
                      thisDayRates[max].valid_to
                    )}`}</div>
                  </div>
                </div>
                <div>
                  <Badge
                    label="Average"
                    icon={<LiaBalanceScaleSolid />}
                    variant="secondary"
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
            <span className="text-sm font-light">
              Octo is working hard to get data ready at around 4pm.
            </span>
          </div>
        ))}
    </div>
  );
};

export default PricePane;
