"use client";

import { useContext, useState } from "react";

import { UserContext } from "@/context/user";
import { WindowResizeContext } from "@/context/windowResize";
import { WindowVisibilityContext } from "@/context/windowVisibility";

import MapChart from "@/components/octopus/MapChart";
import useTariffQuery from "@/hooks/useTariffQuery";

import Loading from "../../app/loading";
import BrushChart from "./BrushChart";
import MapChartAgile from "./MapChartAgile";
import PricePaneAgile from "./PricePaneAgile";
import PricePaneAgile2 from "./PricePaneAgile2";
import Remark from "./Remark";

import { BiImport, BiExport } from "react-icons/bi";

import { ITariffToCompare, Single_tariff } from "@/data/source";

const Tariff = ({
  tariff,
  exportTariff,
  remarks = "",
}: {
  tariff: ITariffToCompare;
  exportTariff: ITariffToCompare;
  remarks?: string;
}) => {
  const [currentPeriod, setCurrentPeriod] = useState(new Date().toUTCString());
  const { value, setValue } = useContext(UserContext);
  useContext(WindowResizeContext);
  useContext(WindowVisibilityContext);

  const { tariff: tariffCode, category } = tariff;
  const { tariff: exportTariffCode, category: exportCategory } = exportTariff;

  const { gsp } = value;

  const {
    data: tariffData,
    isSuccess,
    isLoading,
  } = useTariffQuery<{
    display_name: string;
    full_name: string;
    description: string;
    single_register_electricity_tariffs: Single_tariff;
  }>({
    tariff: tariffCode,
    type: "E",
  });

  const {
    data: exportTariffData,
    isSuccess: exportIsSuccess,
    isLoading: exportIsLoading,
  } = useTariffQuery<{
    display_name: string;
    full_name: string;
    description: string;
    single_register_electricity_tariffs: Single_tariff;
  }>({
    tariff: exportTariffCode,
    type: "E",
  });

  if (isLoading || exportIsLoading)
    return (
      <div className="lg:col-[content] my-4">
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );

  return (
    isSuccess &&
    tariffData && (
      <div className="lg:col-[content] my-4">
        <section className="my-4">
          <div className="flex items-center justify-center font-display">
            <div className="h-14 rounded-md px-3 py-2 ring-offset-background focus:outline-none [&amp;>h1>span]:line-clamp-1 [&amp;>span]:line-clamp-1 w-auto max-w-full text-[clamp(20px,7vw,80px)] text-accentBlue-400 flex items-center justify-center">
              <h1 className="overflow-hidden [&amp;>*]:whitespace-pre  [&amp;>*]:text-ellipsis  [&amp;>*]:overflow-hidden  [&amp;>*]:block! [&amp;>*]:max-w-full">
                <span>
                  {tariffCode.includes("INTELLI") && "Intelligent"} Octopus Flux
                </span>
              </h1>
              <Remark variant="badge">
                {remarks && (
                  <span className="text-accentPink-500 font-bold pr-2">
                    {remarks}
                  </span>
                )}
                [{tariffData[0].full_name}] {tariffData[0].description}
              </Remark>
            </div>
          </div>
        </section>
        <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-6 my-4">
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-accentBlue-200 text-center text-3xl font-display -mb-2">
              <BiImport className="inline-block -translate-y-1 " /> Import
            </h2>
            <PricePaneAgile
              tariff={tariffCode}
              type="E"
              gsp={gsp}
              setCurrentPeriod={setCurrentPeriod}
              category={category}
            />
            <BrushChart
              tariff={tariffCode}
              type="E"
              gsp={gsp}
              duration="2-days"
              height={300}
            />
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Today&apos;s rates
              </div>
              <PricePaneAgile2 tariff={tariffCode} type="E" gsp={gsp} />
            </div>
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Regional unit rates
              </div>
              <MapChartAgile
                tariff={tariffCode}
                type="E"
                gsp={gsp}
                currentPeriod={currentPeriod}
              />
            </div>
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Regional standing charges
              </div>
              <MapChart
                tariff={tariffCode}
                type="E"
                gsp={gsp}
                rate="standing_charge_inc_vat"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-accentBlue-200 text-center text-3xl font-display -mb-2">
              <BiExport className="inline-block -translate-y-1 " /> Export
            </h2>
            <PricePaneAgile
              tariff={exportTariffCode}
              type="E"
              gsp={gsp}
              setCurrentPeriod={setCurrentPeriod}
              category={exportCategory}
            />
            <BrushChart
              tariff={exportTariffCode}
              type="E"
              gsp={gsp}
              duration="2-days"
              height={300}
            />
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Today&apos;s rates
              </div>
              <PricePaneAgile2 tariff={exportTariffCode} type="E" gsp={gsp} />
            </div>
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Regional unit rates
              </div>
              <MapChartAgile
                tariff={exportTariffCode}
                type="E"
                gsp={gsp}
                currentPeriod={currentPeriod}
              />
            </div>
            <div className="flex-1">
              <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
                Regional standing charges
              </div>
              <MapChart
                tariff={exportTariffCode}
                type="E"
                gsp={gsp}
                rate="standing_charge_inc_vat"
              />
            </div>
          </div>
        </section>
      </div>
    )
  );
};

export default Tariff;
