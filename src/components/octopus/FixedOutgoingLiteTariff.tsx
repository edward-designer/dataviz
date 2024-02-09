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

import { EETARIFFS } from "@/data/source";
import PricePaneVariable from "./PricePaneVariable";

const FixedOutgoingLiteTariff = () => {
  const currentExportTariff = EETARIFFS.find((tariff) =>
    tariff.tariff.includes("OUTGOING-LITE-FIX")
  )!;
  const { tariff: tariffCode, category } = currentExportTariff;

  const [currentPeriod, setCurrentPeriod] = useState(new Date().toUTCString());
  const { value, setValue } = useContext(UserContext);

  useContext(WindowResizeContext);
  useContext(WindowVisibilityContext);

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
                [{tariffData[0].full_name} - to be used to Go / Intelligent Go
                Import Tariff] {tariffData[0].description}
              </Remark>
            </div>
          </div>
        </section>
        <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-stretch gap-4 my-4">
          <div className="flex-1">
            <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
              &nbsp;
            </h2>
            <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
              <PricePaneVariable
                tariff={tariffCode}
                type="E"
                gsp={gsp}
                isExport={true}
              />
            </section>
          </div>
          <div className="flex-1">
            <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
              Regional export rates
            </h2>
            <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
              <MapChart tariff={tariffCode} type="E" gsp={gsp} />
            </section>
          </div>
        </section>
      </div>
    )
  );
};

export default FixedOutgoingLiteTariff;
