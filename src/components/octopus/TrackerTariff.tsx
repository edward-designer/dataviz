"use client";

import { ReactNode, useContext, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { TRACKER } from "@/data/source";

import { UserContext } from "@/context/user";
import BrushChart from "./BrushChart";
import PricePane from "./PricePane";
import Remark from "./Remark";
import TariffSelect from "./TariffSelect";
import MapChart from "@/components/octopus/MapChart";

const TrackerTariff = () => {
  const [tariff, setTariff] = useState(TRACKER[0].code);
  const {
    value: { gsp },
  } = useContext(UserContext);

  return (
    <div className="lg:col-[content] my-4">
      <section className="my-4">
        <TariffSelect
          tariff={tariff}
          setTariff={setTariff}
          type="Octopus Tracker Plan"
          source={TRACKER}
        >
          <Remark variant="badge">
            Octopus has been offereing different Tracker plans over the years.
            The currently available plan is marked with the &quot;current&quot;
            label. These plans differ mainly in the maximum chargable rates.
            Please scroll down to see the comparision between different Tracker
            plans. All unit rates inclusive of VAT.
          </Remark>
        </TariffSelect>
      </section>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <PricePane tariff={tariff} type="E" gsp={gsp} />
        <PricePane tariff={tariff} type="G" gsp={gsp} />
      </section>
      <div className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Electricity and Gas Unit Rates Over Time
        <Remark variant="badge">
          The average price caps for standard variable tariff (SVT) shown here
          are for reference only. All Octopus tracker plans have different price
          caps set at the time of joining the plan. Please scroll down to view
          the price caps.
        </Remark>
      </div>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart tariff={tariff} type="EG" gsp={gsp} />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional Energy Unit Rates Map
        <Remark variant="badge">
          The unit rates for different parts of the UK is calcuated based on{" "}
          <a
            href="https://octopus.energy/tracker-faqs//#formula"
            target="_blank"
          >
            a set of formulae
          </a>
          . The prices shown here are usually updated at around 9:30am each day.
          Comparision is made to the average cap of standard variable tariff
          (SVT) of UK.
        </Remark>
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChart tariff={tariff} type="E" gsp={gsp} />
        <MapChart tariff={tariff} type="G" gsp={gsp} />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional Standing Charges Map
        <Remark variant="badge">
          The standing charge is compared to the average standard variable
          tariff (SVT) cap of UK. Different regions have different caps as
          detailed in this{" "}
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
        <MapChart
          tariff={tariff}
          type="G"
          gsp={gsp}
          rate="standing_charge_inc_vat"
        />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Comparision of Octopus Tracker Plans
      </h2>
      <section className="flex justify-center items-center gap-4 my-4 flex-col bg-black/30 rounded-xl p-4 lg:p-10">
        <p className="text-sm">
          Octopus Tracker gives the most transparent energy pricing in the UK.
          Every day, Octopus update the price of energy based on an
          independently published wholesale market price. The unit rate is
          capped according to the following table (inclusive of VAT):
        </p>
        <table cellPadding={1}>
          <thead>
            <tr>
              <th className="w-1/4">Tracker Plan</th>
              <th className="w-1/4">Electricity Cap / kWh</th>
              <th className="w-1/4">Gas Cap / kWh</th>
            </tr>
          </thead>
          <tbody>
            {TRACKER.map((plan) => (
              <tr
                key={plan.code}
                className={`${
                  tariff === plan.code
                    ? "border-2 border-accentPink-500 bg-black/50"
                    : "border-b border-b-accentBlue-950"
                }`}
              >
                <td className="p-2">{plan.name}</td>
                <td className="text-center">{plan.cap.E}</td>
                <td className="text-center">{plan.cap.G}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Octopus Tracker Plans FAQ
      </h2>
      <section className="flex justify-center items-center gap-4 my-4 flex-col bg-black/30 rounded-xl p-4 lg:p-10">
        <h3 className="font-bold text-accentBlue-700">About Octopus Tracker</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-0a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              What have the Ofgem price caps to do with Tracker?
            </AccordionTrigger>
            <AccordionContent>
              Nothing. Tracker plans have much higher price caps set by Octopus
              than the Ofgem price caps as Tracker is a new energy contract not
              protected by Ofgem. But the general trends of Ofgem price cap will
              give a good idea of what the energy prices are going to change in
              the near future.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I am currently on Octopus Agile/Go/flexible/fixed. Will I save
              more by switching to Tracker?
            </AccordionTrigger>
            <AccordionContent>
              The majority of users can save around 10% - 30%. The saving would
              depend on your energy use pattern and amount. But remember energy
              price can go up or down suddenly. Do keep your eyes on the trends
              and take action if deemded appropriate.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Why do the unit rates different depending on where I live?
            </AccordionTrigger>
            <AccordionContent>
              That is because Octopus need to pay different amount of
              operational costs (for maintaining and using the transmission
              network) to deliver energy to the users. This cost is passed onto
              the end users in order to keep the Tracker price as low as
              possible.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <h3 className="font-bold text-accentBlue-700 mt-6">Joining Tracker</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              How do I sign up for the Octopus Tracker plan?
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
                Octopus Tracker page
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
        <h3 className="font-bold text-accentBlue-700 mt-6">Quitting Tracker</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Is there any penalties for leaving Tracker?
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
              and back to Tracker in spring?
            </AccordionTrigger>
            <AccordionContent>
              Octopus has made it not possible to make such timely switches as
              Tracker quitters have to wait 9 months before being allowed to
              switch back to Tracker in order to save their admin costs. But the
              idea of Tracker is that you can save more during summer months
              which can be used to offset some more expensive rates in winter.
              Sticking with Tracker throughout the year is almost certainly
              cheaper than with Ofgem protected plans.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default TrackerTariff;
