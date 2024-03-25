"use client";

import Loading from "@/components/Loading";
import Badge from "@/components/octopus/Badge";
import Comparison from "@/components/octopus/Comparison";
import Remark from "./Remark";

import {
  CapsTSVResult,
  QueryTariffResult,
  TariffResult,
  TariffType,
  gsp,
} from "@/data/source";

import useTariffQuery from "../../hooks/useTariffQuery";

import {
  calculateChangePercentage,
  evenRound,
  priceAccessor,
} from "../../utils/helpers";

import useCurrentLocationPriceCapQuery from "@/hooks/useCurrentLocationPriceCapQuery";
import backgroundE from "../../../public/images/E.jpg";
import backgroundG from "../../../public/images/G.jpg";
import { EnergyIcon } from "./EnergyIcon";
import ErrorMessage from "./ErrorMessage";

const PricePane = ({
  tariff,
  type,
  gsp,
  isExport = false,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
  isExport?: boolean;
}) => {
  const { isLoading, isError, isSuccess, isRefetching, refetch, data, error } =
    useTariffQuery<QueryTariffResult>({
      tariff,
      type,
      gsp,
      dual: true,
    });
  const today = new Date();
  const todayDate = today.toLocaleDateString("en-GB");
  const resultsDay =
    data?.[0]?.results.filter(
      (result) =>
        result.payment_method === "DIRECT_DEBIT" ||
        result.payment_method === null
    ) ?? [];
  const resultsNight =
    data?.[1]?.results.filter(
      (result) =>
        result.payment_method === "DIRECT_DEBIT" ||
        result.payment_method === null
    ) ?? [];

  const priceTodayIndexDay = resultsDay.findIndex(
    (data) =>
      new Date(data.valid_from) <= today &&
      (new Date(data.valid_to) >= today || data.valid_to === null)
  );
  const priceTodayIndexNight = resultsNight.findIndex(
    (data) =>
      new Date(data.valid_from) <= today &&
      (new Date(data.valid_to) >= today || data.valid_to === null)
  );
  const priceNextPeriodIndex =
    priceTodayIndexDay - 1 >= 0 ? priceTodayIndexDay - 1 : null;
  const caps = useCurrentLocationPriceCapQuery({
    gsp: `_${gsp}` as gsp,
  });
  const nextCaps = useCurrentLocationPriceCapQuery({
    gsp: `_${gsp}` as gsp,
    next: true,
  });

  const noPriceTomorrowMessage =
    "The price for next period is usually available one month before the next change.";
  const [priceTodayDisplayDay, __, priceToday] = getPriceDisplay({
    priceTodayIndex: priceTodayIndexDay,
    priceDisplayDate: "today",
    priceCap: caps,
    results: resultsDay,
    type,
  });
  const [priceTodayDisplayNight, ___, priceTonight] = getPriceDisplay({
    priceTodayIndex: priceTodayIndexNight,
    priceDisplayDate: "today",
    priceCap: caps,
    results: resultsNight,
    type,
  });
  const [_, priceChangeTodayVsPriceCap] = getPriceDisplay({
    priceTodayIndex: priceTodayIndexDay,
    priceDisplayDate: "todayVsPriceCap",
    priceCap: caps,
    results: resultsDay,
    type,
  });
  const [____, priceChangeTonightVsPriceCap] = getPriceDisplay({
    priceTodayIndex: priceTodayIndexNight,
    priceDisplayDate: "todayVsPriceCap",
    priceCap: caps,
    results: resultsNight,
    type,
  });
  const [priceChangeNextPeriod] = getPriceDisplay({
    priceTodayIndex: priceTodayIndexDay,
    priceDisplayDate: "tomorrow",
    priceCap: caps,
    results: resultsDay,
    type,
    message: noPriceTomorrowMessage,
  });

  return (
    <div className="pricePane relative flex-1">
      <div
        className="flex flex-col gap-8 p-4 min-h-[250px] md:min-h-[300px] rounded-xl bg-theme-950 border border-accentPink-950 shadow-inner bg-cover"
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
                label={`Today @ ${new Date().toLocaleString("en-GB")}`}
                variant="secondary"
              />
              <div className="font-digit text-6xl text-white flex flex-col items-start gap-1">
                <div className="flex flex-row gap-1">
                  <div className="pr-2">
                    <Badge
                      label="Peak Rate"
                      variant="secondary"
                      className="opacity-60"
                    />
                    {priceTodayDisplayDay}
                    {typeof priceChangeTodayVsPriceCap === "number" &&
                      !isExport && (
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
                              {`${evenRound(Number(caps?.[type]), 2)}p`}
                            </strong>{" "}
                            . This cap is reviewed every quarter. Please note
                            that the Ofgem caps are not applicable to Tracker
                            tariffs which have a much higher cap.
                          </Remark>
                        </Comparison>
                      )}
                  </div>
                  <div className="border-l-2 pl-2 border-dotted border-white/20">
                    <Badge
                      label="Off-Peak Rate"
                      variant="secondary"
                      className="opacity-60"
                    />
                    {priceTodayDisplayNight}
                    {typeof priceChangeTonightVsPriceCap === "number" &&
                      !isExport && (
                        <Comparison
                          change={priceChangeTonightVsPriceCap}
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
                              {`${evenRound(Number(caps?.[type]), 2)}p`}
                            </strong>{" "}
                            . This cap is reviewed every quarter. Please note
                            that the Ofgem caps are not applicable to Tracker
                            tariffs which have a much higher cap.
                          </Remark>
                        </Comparison>
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end items-start">
              {priceNextPeriodIndex !== null ? (
                <div className="flex justify-center items-start flex-col">
                  <Badge
                    label={`From ${new Date(
                      resultsDay[priceNextPeriodIndex].valid_from
                    ).toLocaleDateString("en-GB")}`}
                    variant="secondary"
                  />
                  <div className="flex flex-row">
                    <div className="font-digit text-center text-3xl text-white flex justify-center items-end pr-2">
                      {`${evenRound(
                        Number(resultsDay[priceNextPeriodIndex].value_inc_vat),
                        2
                      )}p`}
                      <Comparison
                        change={
                          ((Number(
                            resultsDay[priceNextPeriodIndex].value_inc_vat
                          ) -
                            Number(priceToday)) /
                            Number(
                              resultsDay[priceNextPeriodIndex].value_inc_vat
                            )) *
                          100
                        }
                        compare="today"
                      />
                    </div>
                    <div className="font-digit text-center text-3xl text-white flex justify-center items-end pl-2 border-l-2 border-dotted border-white/20">
                      {`${evenRound(
                        Number(
                          resultsNight[priceNextPeriodIndex].value_inc_vat
                        ),
                        2
                      )}p`}
                      <Comparison
                        change={
                          ((Number(
                            resultsNight[priceNextPeriodIndex].value_inc_vat
                          ) -
                            Number(priceTonight)) /
                            Number(
                              resultsNight[priceNextPeriodIndex].value_inc_vat
                            )) *
                          100
                        }
                        compare="tonight"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                !isExport &&
                nextCaps && (
                  <div className="flex justify-center items-end flex-col">
                    <Badge
                      label={`${new Date(nextCaps.Date).toLocaleDateString(
                        "en-GB",
                        { month: "short", year: "numeric" }
                      )} price cap`}
                      variant="secondary"
                    />
                    <div className="flex items-center">
                      <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                        {`${evenRound(Number(nextCaps[type]), 2)}p`}
                      </div>
                      <Comparison
                        change={
                          ((evenRound(Number(nextCaps[type]), 2) -
                            evenRound(Number(caps[type]), 2)) /
                            evenRound(Number(caps[type]), 2)) *
                          100
                        }
                        compare="current"
                      />
                    </div>
                  </div>
                )
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
  priceDisplayDate: "today" | "tomorrow" | "todayVsPriceCap";
  priceCap: CapsTSVResult;
  results: TariffResult[];
  type: Exclude<TariffType, "EG">;
  message?: string;
}

const getPriceDisplay = ({
  priceTodayIndex,
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

  if (priceTodayIndex !== undefined) {
    const indexToAccessMap = {
      today: priceTodayIndex,
      tomorrow: priceTodayIndex - 1,
      todayVsPriceCap: priceTodayIndex,
    };
    const comparePriceMap = {
      today: null,
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
