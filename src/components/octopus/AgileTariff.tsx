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
import MapChartAgile from "./MapChartAgile";
import { WindowResizeContext } from "@/context/windowResize";

const AgileTariff = () => {
  const [tariff, setTariff] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(new Date().toUTCString());
  const {
    value: { gsp },
  } = useContext(UserContext);
  useContext(WindowResizeContext);

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
        <BrushChart
          tariff={tariff}
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
          <PricePaneAgile2 tariff={tariff} type="E" gsp={gsp} />
        </div>
        <div className="flex-1">
          <div className="flex-1 text-lg font-bold text-center text-accentPink-600">
            Tomorrow&apos;s rates
          </div>
          <PricePaneAgile2
            tariff={tariff}
            type="E"
            gsp={gsp}
            date={new Date(
              new Date().setDate(new Date().getDate() + 1)
            ).toDateString()}
          />
        </div>
      </section>
      <div className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        1-month unit rate graph
      </div>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart tariff={tariff} type="E" gsp={gsp} />
      </section>
      <section className="flex flex-col md:flex-row items-stretch md:justify-center md:items-center gap-4 my-4 md:mt-8">
        <div className="flex-1">
          <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
            Regional unit rates
          </div>
          <MapChartAgile
            tariff={tariff}
            type="E"
            gsp={gsp}
            currentPeriod={currentPeriod}
          />
        </div>
        {!tariff.includes("OUTGOING") && (
          <div className="flex-1">
            <div className="flex-1 text-lg font-bold text-center  text-accentPink-600">
              Regional standing charges
            </div>
            <MapChart
              tariff={tariff}
              type="E"
              gsp={gsp}
              rate="standing_charge_inc_vat"
            />
          </div>
        )}
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Octopus Agile Plans FAQ
      </h2>
      <section className="flex justify-center items-center gap-4 my-4 flex-col bg-black/30 rounded-xl p-4 lg:p-10">
        <h3 className="font-bold text-accentBlue-700">About Octopus Agile</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-0c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I can only see the prices for electricity. Is there an Agile plan
              for gas?
            </AccordionTrigger>
            <AccordionContent>
              Regretably no. That is because generation of electricity is not
              that agile (puns intended) as generators will need to be working
              continually. The cost of electricity depends on the amount of
              demand vs supply at any given moment. When there is a high demand,
              the unit rate goes up. When there is a surplus, the unit rate goes
              down even to negative as storing excess electricity is costly and
              inefficient, it is more sensible to pay to customers to use up all
              the excess energy at that moment. But for gases, as they are
              already being stored in gas tanks, there are no extra costs if the
              demand is low.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              What have the Ofgem price caps to do with Agile?
            </AccordionTrigger>
            <AccordionContent>
              Nothing. Agile plans have much a higher price cap of 100p per unit
              set by Octopus than the Ofgem price caps as Agile is a new energy
              contract not protected by Ofgem. But the general trends of Ofgem
              price cap will give a good idea of what the energy prices are
              going to change in the near future.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I am currently on Octopus Tracker/Go/flexible/fixed. Will I save
              more by switching to Agile?
            </AccordionTrigger>
            <AccordionContent>
              Whether or not getting more savings through Octopus really depends
              heavily on your energy use pattern. If you can shift all your
              energy use to periods with the lowest unit rates, you can save up
              to 50% vs Ofgem price cap plans. But remember energy price can go
              up or down suddenly. Do keep your eyes on the trends and take
              action if deemded appropriate.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Why do the unit rates different depending on where I live?
            </AccordionTrigger>
            <AccordionContent>
              That is because Octopus need to pay a different amount of
              operational cost (for maintaining and using the transmission
              network) to deliver energy to the users of different locations.
              This cost is passed onto the end users in order to keep the Agile
              price as low as possible.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <h3 className="font-bold text-accentBlue-700 mt-6">Joining Agile</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              How do I sign up for the Octopus Agile plan?
            </AccordionTrigger>
            <AccordionContent>
              For current Octopus clients with smart meters, it is officially
              told to take around 2 weeks, though some managed to get response
              from Octopus within a few hours of signing up and switch over
              within a day or two. It will take longer if you are not currently
              an Octopus client or do not have a smart meters.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              How long now it takes to join Octopus tracker plans?
            </AccordionTrigger>
            <AccordionContent>
              Head over to the{" "}
              <a href="https://octopus.energy/smart/tracker/" target="_blank">
                Octopus Agile page
              </a>{" "}
              and sign up there.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              What if I do not have a smart meter?
            </AccordionTrigger>
            <AccordionContent>
              You can request to have a smart meter installed by Octopus when
              you sign up at no costs to you. But the wait time is over 2 weeks
              for the moment. Before installing the smart meter, you can choose
              to use the standard tariff, such as Flexible Octopus, until your
              smart meter is installed and running properly.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1d" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I have submitted my application for over 2 weeks but still have
              not hear from Octopus. What to do now?
            </AccordionTrigger>
            <AccordionContent>
              Sending emails to support may not be the optimal way to chase in
              this case. People have reflected that sending messages on X is by
              far the most efficient way to get a response.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1e" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              When is the best time to make the switch?
            </AccordionTrigger>
            <AccordionContent>
              Spring is the best time of the year as you can immediately enjoy
              huge savings all over spring, summer and autumn months.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <h3 className="font-bold text-accentBlue-700 mt-6">Quitting Agile</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Is there any penalties for leaving Agile?
            </AccordionTrigger>
            <AccordionContent>
              Absolutely NO. It will take around 2 weeks to switch over to any
              other Octopus tariffs. During this time, you will still be charged
              with the prevailing price. But if you switch away from Octopus,
              you may be able to switch faster depending on the processing time
              of your new energy provider.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Can I switch to flexible plan in winter when the unit rate is high
              and back to Agile in spring?
            </AccordionTrigger>
            <AccordionContent>
              Octopus has made it not possible to make such timely switches as
              Agile quitters have to wait 9 months before being allowed to
              switch back to Agile in order to save their admin costs. But the
              idea of Agile is that you can save more during summer months which
              can be used to offset some more expensive rates in winter.
              Sticking with Agile throughout the year is almost certainly
              cheaper than with Ofgem protected plans.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default AgileTariff;
