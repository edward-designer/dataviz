"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import {
  CapsTSVResult,
  QueryTariffResult,
  TariffCategory,
  TariffResult,
  TariffType,
  gsp,
} from "@/data/source";
import { mean } from "d3";
import Remark from "./Remark";

import useTariffQuery from "../../hooks/useTariffQuery";

import {
  calculateChangePercentage,
  evenRound,
  priceAccessor,
} from "../../utils/helpers";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { EnergyIcon } from "./EnergyIcon";
import ErrorMessage from "./ErrorMessage";
import Timer from "./Timer";
import useCurrentLocationPriceCapQuery from "@/hooks/useCurrentLocationPriceCapQuery";

interface IPricePaneAgile {
  tariff: string;
  type: "E";
  gsp: string;
  setCurrentPeriod: Dispatch<SetStateAction<string>>;
  category?: TariffCategory;
  isExport?: boolean;
}
const PricePaneAgile = ({
  tariff,
  type,
  gsp,
  setCurrentPeriod,
  category = "Agile",
  isExport = false,
}: IPricePaneAgile) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isLoading, isError, isSuccess, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
    });
  const currentHour = new Date().getHours();
  const isNight = currentHour >= 18 || currentHour <= 6;

  const results = data?.[0]?.results ?? [];

  const priceNowIndex =
    results.findIndex((data) => {
      const now = new Date();
      return new Date(data.valid_from) < now && new Date(data.valid_to) > now;
    }) ?? 0;
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
  const caps = useCurrentLocationPriceCapQuery({
    gsp: `_${gsp}` as gsp,
  });

  const nextPeriodLabel = {
    IGo: `NEXT: ${new Date(
      results[priceNowIndex - 1]?.valid_from ?? ""
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(
      results[priceNowIndex - 1]?.valid_to ?? ""
    ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    Go: `NEXT: ${new Date(
      results[priceNowIndex - 1]?.valid_from ?? ""
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(
      results[priceNowIndex - 1]?.valid_to ?? ""
    ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    Agile: "Next 1/2 hr",
    Tracker: "",
    SVT: "",
    Fixed: "",
    Cosy: `NEXT: ${new Date(
      results[priceNowIndex - 1]?.valid_from ?? ""
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(
      results[priceNowIndex - 1]?.valid_to ?? ""
    ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    Chart: "",
    IFlux: `NEXT: ${new Date(
      results[priceNowIndex - 1]?.valid_from ?? ""
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(
      results[priceNowIndex - 1]?.valid_to ?? ""
    ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    Flux: `NEXT: ${new Date(
      results[priceNowIndex - 1]?.valid_from ?? ""
    ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(
      results[priceNowIndex - 1]?.valid_to ?? ""
    ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
  };
  const note =
    "The rates from 11pm today till tomorrow are usually available at 4.00pm. Please revisit this page later to get the updates.";

  const [priceNowDisplay, priceChangeNow] = getPriceDisplay({
    priceNowIndex,
    priceAverage,
    priceCap: caps,
    priceDisplayDate: "now",
    results,
    type,
  });
  const [_, priceNowVsCap] = getPriceDisplay({
    priceNowIndex,
    priceAverage,
    priceCap: caps,
    priceDisplayDate: "nowVsPriceCap",
    results,
    type,
  });
  const [priceNextDisplay, priceChangeNext] = getPriceDisplay({
    priceNowIndex,
    priceAverage,
    priceCap: caps,
    priceDisplayDate: "next",
    results,
    type,
    message: note,
  });

  useEffect(
    () =>
      containerRef.current?.setAttribute(
        "style",
        `background-position: bottom; background-image: linear-gradient(0deg, rgba(0,3,35,0.5) 30% , rgba(0,3,35,0.8) 70%, rgba(0,4,51,1) 90% ),url(${
          isNight ? "/images/Agile-Night.jpg" : "/images/Agile-Day.jpg"
        })`
      ),
    [isNight]
  );

  return (
    <div className="pricePane relative flex-1">
      <div
        ref={containerRef}
        className="flex flex-col gap-8 max-h-[300px] min-h-[300px] rounded-xl p-4 bg-theme-950 border border-accentPink-950 shadow-inner bg-cover"
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
                    {typeof priceChangeNow === "number" &&
                      !["Go", "Cosy", "Flux"].includes(category) && (
                        <Comparison
                          change={priceChangeNow}
                          compare="today average"
                          isExport={isExport}
                        />
                      )}
                    {typeof priceNowVsCap === "number" && !isExport && (
                      <Comparison change={priceNowVsCap} compare="SVT cap">
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
                            {`${caps?.[type]}p`}
                          </strong>{" "}
                          . This cap is reviewed every quarter. Please note that
                          the Ofgem caps are not applicable to Agile tariffs
                          which have a much higher cap.
                        </Remark>
                      </Comparison>
                    )}
                  </div>
                </div>
              </div>
              {typeof priceChangeNext === "number" && (
                <div className="opacity-80">
                  <Badge
                    label={nextPeriodLabel[category]}
                    variant="secondary"
                  />
                  <div className="font-digit text-4xl text-white flex flex-row items-end justify-start gap-1">
                    <div>{priceNextDisplay}</div>
                    <div className="flex">
                      {typeof priceChangeNext === "number" && (
                        <Comparison
                          change={priceChangeNext}
                          compare="now"
                          isExport={isExport}
                        />
                      )}
                    </div>
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

export default PricePaneAgile;

interface IGetPriceDisplay {
  priceNowIndex: number | undefined;
  priceAverage: number;
  priceDisplayDate: "now" | "next" | "nowVsPriceCap";
  priceCap: CapsTSVResult;
  results: TariffResult[];
  type: Exclude<TariffType, "EG">;
  message?: string;
}

const getPriceDisplay = ({
  priceNowIndex,
  priceAverage,
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

  if (priceNowIndex !== undefined) {
    const indexToAccessMap = {
      now: priceNowIndex,
      next: priceNowIndex - 1,
      nowVsPriceCap: priceNowIndex,
    };
    const comparePriceMap = {
      now: priceAverage,
      next: priceAccessor(results, priceNowIndex),
      nowVsPriceCap: Number(priceCap?.[type]),
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
