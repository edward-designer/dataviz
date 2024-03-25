"use client";

import { ReactNode, useContext, useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { CURRENT_VARIABLE_CODE, TRACKER } from "@/data/source";

import { UserContext } from "@/context/user";
import BrushChart from "./BrushChart";
import PricePane from "./PricePane";
import Remark from "./Remark";
import TariffSelect from "./TariffSelect";
import MapChart from "@/components/octopus/MapChart";
import { WindowResizeContext } from "@/context/windowResize";
import { WindowVisibilityContext } from "@/context/windowVisibility";
import PricePaneVariable from "./PricePaneVariable";
import PricePaneVariableE7 from "./PricePaneVariableE7";
import useGetTariffCode from "@/hooks/useGetTariffCode";

const VariableTariff = () => {
  const [tariff, setTariff] = useState(CURRENT_VARIABLE_CODE);
  const {
    value: { gsp },
  } = useContext(UserContext);
  const { data, isLoading, isSuccess, isError } = useGetTariffCode({});
  useContext(WindowResizeContext);
  useContext(WindowVisibilityContext);

  useEffect(() => {
    if (isSuccess && data?.code) {
      setTariff(data.code);
    }
  }, [data?.code, isSuccess]);

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <div className="flex items-center justify-center font-display">
          <div className="h-14 rounded-md px-3 py-2 ring-offset-background focus:outline-none [&amp;>h1>span]:line-clamp-1 [&amp;>span]:line-clamp-1 w-auto max-w-full text-[clamp(20px,7vw,80px)] text-accentBlue-400 flex items-center justify-center">
            <h1 className="overflow-hidden [&amp;>*]:whitespace-pre  [&amp;>*]:text-ellipsis  [&amp;>*]:overflow-hidden  [&amp;>*]:block! [&amp;>*]:max-w-full">
              <span>Flexible Octopus Economy 7</span>
            </h1>
            <Remark variant="badge">
              Flexible Octopus also provides a dual register electricity tariff
              with extra low off-peak rates (typically between midnight and 7
              am) while the day rate is more expensive than the all-day Ofgem
              caps. All unit rates inclusive of VAT.
            </Remark>
          </div>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <PricePaneVariableE7 tariff={tariff} type="E" gsp={gsp} />
      </section>
      <div className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Changes over time
        <Remark variant="badge">
          During the period when the variable unit rate is higher than the Ofgem
          energy cap, the difference is to be offset by the Government Energy
          Price Guarantee scheme.
        </Remark>
      </div>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart
          tariff={tariff}
          type="E"
          gsp={gsp}
          duration="year"
          dual={true}
        />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional energy unit rates
        <Remark>
          The unit rates for different parts of the UK is calcuated based on{" "}
          <a
            href="https://octopus.energy/tracker-faqs//#formula"
            target="_blank"
          >
            a set of formulae
          </a>
          . The prices shown here are usually updated at around 9:30am each day.
          Comparision is made to the cap of standard variable tariff (SVT) of
          UK.
        </Remark>
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChart
          tariff={tariff}
          type="E"
          gsp={gsp}
          dual={true}
          rate="day_unit_rate_inc_vat"
        />
        <MapChart
          tariff={tariff}
          type="E"
          gsp={gsp}
          dual={true}
          rate="night_unit_rate_inc_vat"
        />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional standing charges
        <Remark variant="badge">
          The standing charge is compared to the standard variable tariff (SVT)
          cap of UK. Different regions have different caps as detailed in this{" "}
          <a
            href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/get-energy-price-cap-standing-charges-and-unit-rates-region"
            target="_blank"
          >
            Ofgem article
          </a>
          .
        </Remark>
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChart
          tariff={tariff}
          type="E"
          gsp={gsp}
          rate="standing_charge_inc_vat"
        />
      </section>
    </div>
  );
};

export default VariableTariff;
