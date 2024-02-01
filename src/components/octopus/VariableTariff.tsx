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
              <span>Octopus Variable</span>
            </h1>
            <Remark variant="badge">
              Octopus is offering variable tariff at a price that is protected
              by the Ofgem energy price caps and a standing charge which is 4%
              lower than the cap (lowest among energy suppliers in the UK). All
              unit rates inclusive of VAT.
            </Remark>
          </div>
        </div>
      </section>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <PricePaneVariable tariff={tariff} type="E" gsp={gsp} />
        <PricePaneVariable tariff={tariff} type="G" gsp={gsp} />
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
        <BrushChart tariff={tariff} type="EG" gsp={gsp} duration="year" />
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
        <MapChart tariff={tariff} type="E" gsp={gsp} />
        <MapChart tariff={tariff} type="G" gsp={gsp} />
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
        <MapChart
          tariff={tariff}
          type="G"
          gsp={gsp}
          rate="standing_charge_inc_vat"
        />
      </section>

      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Octopus Variable Tariff FAQ
      </h2>
      <section className="flex justify-center items-center gap-4 my-4 flex-col bg-black/30 rounded-xl p-4 lg:p-10">
        <h3 className="font-bold text-accentBlue-700">
          About Octopus Variable
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-0a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              What have the Ofgem price caps to do with Variable?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              Octopus variable tariff is restricted by Ofgem price caps. But,
              the good news is that Octopus endeavors to set the price lower
              than the maximum allowed, often in the order of 10% less.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I am currently on Octopus Agile/Tracker/Go/fixed. Will I save more
              by switching to Variable?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              Not likely.
              <br />
              <br />
              In most cases, the majority of users can save around 10% - 30%
              with Octopus Tracker or Agile. But in extreme times, as the caps
              of Tracker and Agile are way highly than the Ofgem caps, Tracker
              and Agile users will be exposed to the risk of getting charged for
              up to 100p for each unit of electricity and 30p for gas. But, this
              is highly unlikely. And Tracker and Agile users can switch back
              any time they want to Variable without penalties should the
              extremely high rates continue for a prolonged period of time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-0c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Why do the unit rates different depending on where I live?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              That is because Octopus needs to pay a different amount of
              operational cost (for maintaining and using the transmission
              network) to deliver energy to the users of different locations.
              This cost is passed onto the end users in order to keep the
              Variable price as low as possible. This is also the normal
              practices for energy companies.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <h3 className="font-bold text-accentBlue-700 mt-6">Joining Variable</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              How long does it take to join the Octopus Variable tariff?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              For current Octopus clients, it is officially told to take around
              2 weeks, though some have managed to get a response from Octopus
              within a few hours of signing up and switch over within a day or
              two. It will take longer if you are not currently an Octopus
              client.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1b" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              How do I sign up for the Octopus Variable tariff?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              Head over to the{" "}
              <a href="https://octopus.energy/tariffs/" target="_blank">
                Octopus Variable page
              </a>{" "}
              and sign up there.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1c" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              What if I do not have a smart meter?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              A smart meter is NOT required for the Octopus Variable. But, you
              can request to have a FREE smart meter installed by Octopus when
              you sign up at no costs to you.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1d" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              I have submitted my application for over 2 weeks but still have
              not heard from Octopus. What to do now?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              According to experiences of Octopus users, sending emails to
              support may not be the optimal way to chase in this case. Sending
              messages on X is by far the most efficient way to get a response
              within a few hours. Seems they have dedicated advisers monitoring
              social media messages.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <h3 className="font-bold text-accentBlue-700 mt-6">
          Quitting Variable
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2a" className="border-b-accentBlue-600/50">
            <AccordionTrigger>
              Are there any penalties for leaving Variable?
            </AccordionTrigger>
            <AccordionContent className="text-white/60">
              Absolutely NO. You can switch out to other energy providers or
              other Octopus Energy tariffs anytime you like.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
};

export default VariableTariff;
