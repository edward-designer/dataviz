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

const PricePane = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: "E";
  gsp: string;
}) => {
  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
    });

  const results = data?.[0]?.results ?? [];

  const priceNowIndex = results.findIndex((data) => {
    const now = new Date();
    return new Date(data.valid_from) < now && new Date(data.valid_to) > now;
  });
  const todayRates = results.filter((data) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return (
      new Date(data.valid_from) >= todayStart &&
      new Date(data.valid_from) <= todayEnd
    );
  });
  const priceAverage = mean(todayRates, (d) => d.value_inc_vat) ?? 0;
  const min = minIndex(todayRates, (d) => d.value_inc_vat);
  const max = maxIndex(todayRates, (d) => d.value_inc_vat);

  return (
    <div
      className="relative flex-1 flex flex-col gap-8 max-h-[300px] min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`,
      }}
    >
      {isLoading && <Loading />}
      {isError && <ErrorMessage error={error} errorHandler={() => refetch()} />}
      {isSuccess && (
        <>
          <div className="flex flex-1 flex-row justify-between gap-4 max-h-full overflow-hidden">
            <HalfHourlyChart
              rates={todayRates}
              min={min}
              max={max}
              priceAverage={priceAverage}
            />
            <div className="flex flex-col justify-between divide-y [&>div]:border-accentBlue-900">
              <div>
                <Badge
                  label="Lowest"
                  icon={<TbPigMoney className="stroke-accentBlue-500" />}
                  variant="secondary"
                />
                <div className="font-digit text-4xl text-white flex flex-col items-end justify-start">
                  <FormattedPrice price={todayRates[min].value_inc_vat} />
                  <div className="text-xs">{`@ ${formatLocaleTimePeriod(
                    todayRates[min].valid_from,
                    todayRates[min].valid_to
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
                  <FormattedPrice price={todayRates[max].value_inc_vat} />
                  <div className="text-xs">{`@ ${formatLocaleTimePeriod(
                    todayRates[max].valid_from,
                    todayRates[max].valid_to
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
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricePane;