"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import Remark from "./Remark";
import { mean } from "d3";
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
  isSameDate,
  isToday,
  priceAccessor,
} from "../../utils/helpers";

import ErrorMessage from "./ErrorMessage";
import { EnergyIcon } from "./EnergyIcon";
import Timer from "./Timer";
import { Dispatch, SetStateAction } from "react";

interface IPricePane {
  tariff: string;
  type: "E";
  gsp: string;
  setCurrentPeriod: Dispatch<SetStateAction<string>>;
}
const PricePane = ({ tariff, type, gsp, setCurrentPeriod }: IPricePane) => {
  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
    });
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 18 || currentHour <= 6;

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

  const note =
    "The rates from 11pm today till tomorrow are usually available at 4.00pm. Please revisit this page later to get the updates.";

  const [priceNowDisplay, priceChangeNow] = getPriceDisplay(
    priceNowIndex,
    priceAverage,
    "now",
    results,
    type
  );
  const [_, priceNowVsCap] = getPriceDisplay(
    priceNowIndex,
    priceAverage,
    "nowVsPriceCap",
    results,
    type
  );
  const [priceNextDisplay, priceChangeNext] = getPriceDisplay(
    priceNowIndex,
    priceAverage,
    "next",
    results,
    type,
    note
  );

  return (
    <div className="pricePane relative flex-1">
      <div
        className="flex flex-col gap-8 max-h-[300px] min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-800/60 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0,3,35,0.5) 30% , rgba(0,3,35,0.8) 70%, rgba(0,4,51,1) 90% ),url(${
            isNight ? "/images/Agile-Night.jpg" : "/images/Agile-Day.jpg"
          })`,
        }}
      >
        {isLoading && <Loading />}
        {isError && (
          <ErrorMessage error={error} errorHandler={() => refetch()} />
        )}
        {isSuccess && (
          <>
            <EnergyIcon type={type} />
            <div className="flex-1">
              <Timer setCurrentPeriod={setCurrentPeriod} />
            </div>

            <div className="flex flex-col justify-between items-start gap-4">
              <div>
                <Badge label="NOW" variant="secondary" />
                <div className="font-digit text-6xl text-white flex flex-row items-end justify-start gap-1">
                  <div>{priceNowDisplay}</div>
                  <div className="flex">
                    {typeof priceChangeNow === "number" && (
                      <Comparison
                        change={priceChangeNow}
                        compare="today average"
                      />
                    )}
                    {typeof priceNowVsCap === "number" && (
                      <Comparison change={priceNowVsCap} compare="SVT cap">
                        <Remark variant="badge">
                          The{" "}
                          <a
                            href="https://www.ofgem.gov.uk/energy-price-cap"
                            target="_blank"
                          >
                            Ofgem Price Cap for standard variable tariff (SVT)
                          </a>{" "}
                          is currently{" "}
                          <strong className="text-bold">
                            {`${priceCap[type]}p`}
                          </strong>{" "}
                          (from 1 October to 31 December 2023). Please note that
                          the Ofgem caps are not applicable to Agile tariffs
                          which have a 100p cap.
                        </Remark>
                      </Comparison>
                    )}
                  </div>
                </div>
              </div>
              <div className="opacity-80">
                <Badge label="NEXT 1/2 hr" variant="secondary" />
                <div className="font-digit text-4xl text-white flex flex-row items-end justify-start gap-1">
                  <div>{priceNextDisplay}</div>
                  <div className="flex">
                    {typeof priceChangeNext === "number" && (
                      <Comparison change={priceChangeNext} compare="now" />
                    )}
                  </div>
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

const getPriceDisplay = (
  priceNowIndex: number | undefined,
  priceAverage: number,
  priceDisplayDate: "now" | "next" | "nowVsPriceCap",
  results: TariffResult[],
  type: keyof typeof priceCap,
  message = "Sorry, the price is currently unavailable, please check back later."
) => {
  let display = (
    <>
      --
      <Remark>{message}</Remark>
    </>
  );
  let changeVsPrevDay: boolean | number = false;
  let price: string | number = "--";

  if (priceNowIndex !== undefined) {
    const indexToAccessMap = {
      now: priceNowIndex,
      next: priceNowIndex - 1,
      nowVsPriceCap: priceNowIndex,
    };
    const comparePriceMap = {
      now: priceAverage,
      next: priceAccessor(results, priceNowIndex),
      nowVsPriceCap: priceCap[type],
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

  return [display, changeVsPrevDay] as const;
};
