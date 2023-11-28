"use client";

import { ReactNode, useContext, useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { UserContext } from "@/context/user";
import BrushChart from "./BrushChart";
import PricePaneAgile from "./PricePaneAgile";
import Remark from "./Remark";
import TariffSelect from "./TariffSelect";
import MapChart from "@/components/octopus/MapChart";
import { json } from "d3";
import { useQuery } from "@tanstack/react-query";
import { ITariffPlan, QueryProducts } from "@/data/source";
import PricePaneAgile2 from "./PricePaneAgile2";

const AgileTariff = () => {
  const [tariff, setTariff] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(
    new Date().toLocaleTimeString()
  );
  const {
    value: { gsp },
  } = useContext(UserContext);

  const queryCapFn = (url: string) => async () => {
    const data: QueryProducts | undefined = await json(url);
    const agile =
      data?.results.filter((plan) => plan.full_name.includes("Agile")) ?? [];
    return agile.map(
      ({ code, display_name }) =>
        ({
          code,
          name: display_name,
          currentPlan: true,
        } as ITariffPlan)
    );
  };
  const AgilePlans = useQuery({
    queryKey: ["getAgilePlans"],
    queryFn: queryCapFn(
      "https://api.octopus.energy/v1/products/?brand=OCTOPUS_ENERGY"
    ),
  });

  useEffect(() => {
    if (!AgilePlans.data) return;
    setTariff(AgilePlans.data[0].code);
  }, [AgilePlans.data]);

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <TariffSelect
          tariff={tariff}
          setTariff={setTariff}
          type="Octopus Agile Plan"
          source={AgilePlans.data ?? []}
        >
          <Remark variant="badge">
            With Agile Octopus, you get access to half-hourly energy prices,
            tied to wholesale prices and updated daily. Outgoing Octopus Agile
            rate pays you for all your exported energy based on the day-ahead
            wholesale rate.
            <br />
            <br />
            Kindly note that the market index used to calculate unit rates is
            based in the CET timezone (UTC+1) and so its “day” corresponds to
            11pm to 11pm in UK time. The unit rates for tomorrow are updated at
            around 4pm each day. Hence you will see only rates up to 11pm before
            4pm.
          </Remark>
        </TariffSelect>
      </section>
      <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-4 my-4">
        <PricePaneAgile
          tariff={tariff}
          type="E"
          gsp={gsp}
          setCurrentPeriod={setCurrentPeriod}
        />
        <PricePaneAgile2 tariff={tariff} type="E" gsp={gsp} />
      </section>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart tariff={tariff} type="E" gsp={gsp} />
      </section>
    </div>
  );
};

export default AgileTariff;
