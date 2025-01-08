"use client";

import { useContext } from "react";

import { UserContext } from "@/context/user";
import { gsp } from "@/data/source";
import usePriceCapQuery from "@/hooks/usePriceCapQuery";
import Remark from "./Remark";
import { EnergyIcon } from "./EnergyIcon";
import Badge from "./Badge";
import { evenRound } from "@/utils/helpers";

import backgroundE from "../../../public/images/E.jpg";
import backgroundG from "../../../public/images/G.jpg";
import Comparison from "./Comparison";
import { HiVizContext } from "@/context/hiViz";
import MapChartCapsChange from "./MapChartCapsChange";

const PriceCapContainer = () => {
  const { value } = useContext(UserContext);
  const { hiViz } = useContext(HiVizContext);
  const { gsp } = value;

  const { data: priceCapsData } = usePriceCapQuery({ gsp: `_${gsp}` as gsp });

  if (!priceCapsData) return;

  const currentCaps = priceCapsData?.find(
    (caps) =>
      caps.Region === `_${gsp}` &&
      new Date(caps.Date).valueOf() < new Date().valueOf()
  );
  const nextCaps = priceCapsData?.find(
    (caps) =>
      caps.Region === `_${gsp}` &&
      new Date(caps.Date).valueOf() > new Date().valueOf()
  );

  const { E, ES, G, GS } = currentCaps!;

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <div className="flex items-center justify-center font-display">
          <div className="h-14 rounded-md px-3 py-2 ring-offset-background focus:outline-none [&amp;>h1>span]:line-clamp-1 [&amp;>span]:line-clamp-1 w-auto max-w-full text-[clamp(20px,7vw,80px)] text-accentBlue-400 flex items-center justify-center">
            <h1 className="overflow-hidden [&amp;>*]:whitespace-pre  [&amp;>*]:text-ellipsis  [&amp;>*]:overflow-hidden  [&amp;>*]:block! [&amp;>*]:max-w-full">
              <span>2025 Jan Ofgem Price Caps</span>
            </h1>
            <Remark variant="badge">
              We often hear the news telling us &quot;Households are set to pay
              £238 less a year in energy bills from April after Ofgem unveiled
              its energy price cap&quot; but what does that actually mean for
              ME? This page gives you the exact unit rate changes based on your
              location. No more vague figures!
            </Remark>
          </div>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-start gap-4 my-4">
        <div className="pricePane relative flex-1">
          <div
            className={`rounded-xl flex flex-col justify-between gap-8 p-4 min-h-[200px] md:min-h-[250px] bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover`}
            style={{
              backgroundImage: hiViz
                ? `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`
                : `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% ),url(${backgroundE.src})`,
            }}
          >
            <EnergyIcon type="E" />
            <div className="flex flex-col w-full  text-accentBlue-500">
              <Badge label="Current Price Caps" variant="secondary" />
              <div className="flex justify-start items-start flex-wrap gap-4">
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(E), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span className="text-xs font-thin font-sans pl-1">
                    Unit Rate
                  </span>
                </div>
                <div className="text-accentBlue-500 text-3xl">/</div>
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(ES), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span className="text-xs font-thin font-sans pl-1">
                    Standing Charge
                  </span>
                </div>
              </div>
            </div>
            {nextCaps?.E && nextCaps?.ES && nextCaps?.Date && (
              <div className="flex self-stretch flex-col w-full  text-accentBlue-500">
                <Badge
                  label={`${new Date(nextCaps.Date).toLocaleDateString(
                    "en-GB",
                    { year: "numeric", month: "short" }
                  )} Price Caps`}
                  variant="secondary"
                />
                <div className="flex justify-start items-start flex-wrap gap-x-4 gap-y-1">
                  <div className="flex justify-center items-start flex-col">
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(Number(nextCaps.E), 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                      <Comparison
                        change={
                          ((Number(nextCaps.E) - Number(E)) * 100) / Number(E)
                        }
                        compare="current caps"
                      />
                    </div>
                    <span className="text-xs font-thin font-sans pl-1">
                      Unit Rate
                    </span>
                  </div>
                  <div className="text-accentBlue-500 text-3xl">/</div>
                  <div className="flex justify-center items-start flex-col">
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(Number(nextCaps.ES), 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                      <Comparison
                        change={
                          ((Number(nextCaps.ES) - Number(ES)) * 100) /
                          Number(ES)
                        }
                        compare="current caps"
                      />
                    </div>
                    <span className="text-xs font-thin font-sans pl-1">
                      Standing Charge
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="pricePane relative flex-1">
          <div
            className={`rounded-xl flex flex-col justify-between gap-8 p-4 min-h-[200px] md:min-h-[250px] bg-theme-950 border border-accentPink-950 shadow-inner bg-gradient-to-br from-transparent via-theme-800/20 to-purple-600/30 bg-cover`}
            style={{
              backgroundImage: hiViz
                ? `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% )`
                : `linear-gradient(0deg, rgba(0,3,35,0.7) 30% , rgba(0,3,35,0.9) 70%, rgba(0,4,51,1) 100% ),url(${backgroundG.src})`,
            }}
          >
            <EnergyIcon type="G" />
            <div className="flex flex-col w-full text-accentBlue-500">
              <Badge label="Current Price Caps" variant="secondary" />
              <div className="flex justify-start items-start flex-wrap gap-4">
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(G), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span className="text-xs font-thin font-sans pl-1">
                    Unit Rate
                  </span>
                </div>
                <div className="text-accentBlue-500 text-3xl">/</div>
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(GS), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span className="text-xs font-thin font-sans pl-1">
                    Standing Charge
                  </span>
                </div>
              </div>
            </div>
            {nextCaps?.G && nextCaps?.GS && nextCaps?.Date && (
              <div className="flex self-stretch flex-col w-full text-accentBlue-500">
                <Badge
                  label={`${new Date(nextCaps.Date).toLocaleDateString(
                    "en-GB",
                    { year: "numeric", month: "short" }
                  )} Price Caps`}
                  variant="secondary"
                />
                <div className="flex justify-start items-start flex-wrap gap-x-4 gap-y-1">
                  <div className="flex justify-center items-start flex-col">
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(Number(nextCaps.G), 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                      <Comparison
                        change={
                          ((Number(nextCaps.G) - Number(G)) * 100) / Number(G)
                        }
                        compare="current caps"
                      />
                    </div>
                    <span className="text-xs font-thin font-sans pl-1">
                      Unit Rate
                    </span>
                  </div>
                  <div className="text-accentBlue-500 text-3xl">/</div>
                  <div className="flex justify-center items-start flex-col">
                    <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                      {evenRound(Number(nextCaps.GS), 2, true)}
                      <span className="text-sm font-thin font-sans pl-1">
                        p
                      </span>
                      <Comparison
                        change={
                          ((Number(nextCaps.GS) - Number(GS)) * 100) /
                          Number(GS)
                        }
                        compare="current caps"
                      />
                    </div>
                    <span className="text-xs font-thin font-sans pl-1">
                      Standing Charge
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600 mt-10">
        Regional Energy Unit Rates Caps Change
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChartCapsChange type="E" gsp={value.gsp} rate="E" />
        <MapChartCapsChange type="G" gsp={value.gsp} rate="G" />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional Standing Charge Caps Change
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChartCapsChange type="E" gsp={value.gsp} rate="ES" />
        <MapChartCapsChange type="G" gsp={value.gsp} rate="GS" />
      </section>
    </div>
  );
};

export default PriceCapContainer;
