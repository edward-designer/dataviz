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

import { ITariffToCompare, Single_tariff } from "@/data/source";

const Tariff = ({
  tariff,
  remarks = "",
  isExport = false,
}: {
  tariff: ITariffToCompare;
  remarks?: string;
  isExport?: boolean;
}) => {
  const [currentPeriod, setCurrentPeriod] = useState(new Date().toUTCString());
  const { value, setValue } = useContext(UserContext);
  useContext(WindowResizeContext);
  useContext(WindowVisibilityContext);

  const { tariff: tariffCode, category } = tariff;

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

  if (isLoading)
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
                <span>{tariffData[0].display_name}</span>
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
        <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-4 my-4">
          <PricePaneAgile
            tariff={tariffCode}
            type="E"
            gsp={gsp}
            setCurrentPeriod={setCurrentPeriod}
            category={category}
            isExport={isExport}
          />
          <BrushChart
            tariff={tariffCode}
            type="E"
            gsp={gsp}
            duration="2-days"
            height={300}
          />
        </section>
        <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-4 my-4 md:mt-8">
          <div className="flex-1">
            <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
              Today&apos;s rates
            </div>
            <PricePaneAgile2
              tariff={tariffCode}
              type="E"
              gsp={gsp}
              isExport={isExport}
            />
          </div>
          <div className="flex-1">
            <div className="flex-1 text-lg font-bold text-center text-accentPink-600">
              Tomorrow&apos;s rates
            </div>
            <PricePaneAgile2
              tariff={tariffCode}
              type="E"
              gsp={gsp}
              date={new Date(
                new Date().setDate(new Date().getDate() + 1)
              ).toDateString()}
              isExport={isExport}
            />
          </div>
        </section>
        <div className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
          Changes over the past month
        </div>
        <section className="flex justify-center items-center gap-4 my-4">
          <BrushChart tariff={tariffCode} type="E" gsp={gsp} duration="month" />
        </section>
        <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-4 my-4 md:mt-8">
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
          {!tariffCode.includes("OUTGOING") && (
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
          )}
        </section>
      </div>
    )
  );
};

export default Tariff;
