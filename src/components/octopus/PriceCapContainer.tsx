"use client";

import { useContext } from "react";

import { UserContext } from "@/context/user";
import { gsp } from "@/data/source";
import usePriceCapQuery from "@/hooks/usePriceCapQuery";
import Remark from "./Remark";
import { EnergyIcon } from "./EnergyIcon";
import Badge from "./Badge";
import { evenRound } from "@/utils/helpers";

const PriceCapContainer = () => {
  const { value } = useContext(UserContext);
  const { gsp } = value;

  const { data: priceCapsData } = usePriceCapQuery({ gsp: `_${gsp}` as gsp });

  if (!priceCapsData) return;

  const currentCaps = priceCapsData?.find(
    (caps) =>
      caps.Region === `_${gsp}` &&
      new Date(caps.Date).valueOf() < new Date().valueOf()
  );

  const { E, ES, G, GS } = currentCaps!;

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <div className="flex items-center justify-center font-display">
          <div className="h-14 rounded-md px-3 py-2 ring-offset-background focus:outline-none [&amp;>h1>span]:line-clamp-1 [&amp;>span]:line-clamp-1 w-auto max-w-full text-[clamp(20px,7vw,80px)] text-accentBlue-400 flex items-center justify-center">
            <h1 className="overflow-hidden [&amp;>*]:whitespace-pre  [&amp;>*]:text-ellipsis  [&amp;>*]:overflow-hidden  [&amp;>*]:block! [&amp;>*]:max-w-full">
              <span>Ofgem Price Caps</span>
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
          <div className="flex flex-col gap-4 p-4 min-h-[250px] md:min-h-[250px] rounded-xl bg-theme-950 border border-accentPink-950 shadow-inner bg-cover">
            <EnergyIcon type="E" />
            <div className="flex flex-1 self-stretch flex-col w-full">
              <Badge label="Current Price Caps" variant="secondary" />
              <div className="flex justify-start items-start flex-wrap gap-4">
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(E), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span className="text-sm">Unit Rate</span>
                </div>
                <div className="flex justify-center items-start flex-col">
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(ES), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                  <span>Standing Charge</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start flex-wrap">
              {ES !== null && (
                <div className="flex justify-center items-start flex-col">
                  <Badge label="Standing Charge" variant="secondary" />
                  <div className="font-digit font-thin text-center text-3xl text-white flex justify-center items-end">
                    {evenRound(Number(ES), 2, true)}
                    <span className="text-sm font-thin font-sans pl-1">p</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriceCapContainer;
