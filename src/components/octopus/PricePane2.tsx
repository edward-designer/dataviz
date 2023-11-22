"use client";
import Lottie from "lottie-react";
import electricityIcon from "../../../public/lottie/electricity.json";
import gasIcon from "../../../public/lottie/gas.json";
import { isToday, priceAccessor } from "../../utils/helpers";
import { ENERGY_TYPE, TariffType, priceCap } from "@/data/source";
import Badge from "@/components/octopus/Badge";
import Loading from "@/components/Loading";
import Comparison from "@/components/octopus/Comparison";
import backgroundE from "../../../public/images/E.jpg";
import backgroundG from "../../../public/images/G.jpg";
import Remark from "./Remark";
import useTariffQuery from "@/hooks/useTariffQuery";

const PricePane2 = ({
  tariff,
  type,
  gsp,
}: {
  tariff: string;
  type: Exclude<TariffType, "EG">;
  gsp: string;
}) => {
  const { isLoading, isError, isSuccess, data, error } = useTariffQuery({
    tariff,
    type,
    gsp,
  });
  const results = data?.[0]?.results ?? [];
  const priceTodayIndex = results.findIndex((data) =>
    isToday(new Date(data.valid_from))
  );

  const priceYesterday = priceAccessor(results, priceTodayIndex + 1) ?? 0;
  const priceToday = priceAccessor(results, priceTodayIndex) ?? 0;
  const priceTomorrow =
    priceTodayIndex > 0 ? priceAccessor(results, priceTodayIndex - 1) : "--";
  const priceTomorrowDisplay = priceTomorrow ? (
    <>
      {priceTomorrow}
      <span className="text-sm font-sans pl-1">p</span>
    </>
  ) : (
    <>
      --
      <Remark>
        Tomorrow’s rates is usually available between 11.00am and 6.00pm
      </Remark>
    </>
  );
  return (
    <div
      className="relative flex-1 flex items-center justify-center flex-col min-h-[250px] md:min-h-[300px] rounded-xl bg-theme-950 border border-accentPink-900/50 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover"
      style={{
        backgroundImage: `linear-gradient(140deg, rgba(0,3,35,0.99) 30% , rgba(0,4,51,0.6) 100% ),url(${
          type === "E" ? backgroundE.src : backgroundG.src
        })`,
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="absolute top-4 left-0 flex flex-col items-center justify-center px-2 ">
            <Lottie
              animationData={type === "G" ? gasIcon : electricityIcon}
              loop={2}
              aria-hidden={true}
              className="w-20 h-20"
              initialSegment={[0, 25]}
            />
            <span className="text-accentBlue-700 -mt-2">
              {ENERGY_TYPE[type]}
            </span>
          </div>
          <div className="scale-75 opacity-60 flex justify-center items-center flex-col mt-2">
            <Badge label="YESTERDAY" variant="secondary" />
            <div className="font-digit font-thin text-center text-6xl text-white flex justify-center items-center">
              {priceYesterday}
              <span className="text-sm font-sans pl-1">p</span>
            </div>
          </div>
          <div className="flex flex-1 justify-center items-center flex-col my-2 scale-110">
            <Badge label={`TODAY - ${new Date().toLocaleDateString()}`} />
            <div className="font-digit text-center text-6xl text-white flex justify-center items-center">
              <Comparison
                change={
                  priceToday !== 0
                    ? parseInt(
                        (
                          ((priceToday - priceYesterday) / priceYesterday) *
                          100
                        ).toFixed(0)
                      )
                    : null
                }
                compare="yesterday"
              />
              {priceToday}
              <span className="text-sm font-sans pl-1">p</span>
              <Comparison
                change={
                  priceToday !== 0
                    ? parseInt(
                        (
                          ((priceToday - priceCap[type]) / priceCap[type]) *
                          100
                        ).toFixed(0)
                      )
                    : null
                }
                compare="price cap"
              >
                <Remark variant="badge">
                  The{" "}
                  <a
                    href="https://www.ofgem.gov.uk/energy-price-cap"
                    target="_blank"
                  >
                    Ofgem Price Cap
                  </a>{" "}
                  is currently{" "}
                  <strong className="text-bold">
                    {type === "E" ? "27" : "7"}p
                  </strong>{" "}
                  (from 1 October to 31 December 2023).
                </Remark>
              </Comparison>
            </div>
          </div>
          <div className="scale-90 opacity-60 flex justify-center items-center flex-col mb-2">
            <Badge label="TOMORROW" variant="secondary" />
            <div className="font-digit text-center text-6xl text-white flex justify-center items-center">
              {typeof priceTomorrow === "number" && (
                <Comparison
                  change={parseInt(
                    (((priceTomorrow - priceToday) / priceToday) * 100).toFixed(
                      0
                    )
                  )}
                  compare="today"
                />
              )}
              {priceTomorrowDisplay}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricePane2;
