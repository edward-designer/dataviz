"use client";

/*
 * global states: (postcode), gsp, (api key, account number) => to be stored in localstorage
*  server states: products/tariff 
https://api.octopus.energy/v1/products/?brand=OCTOPUS_ENERGY

tracker code:
<select id="P1_TRACKER" name="P1_TRACKER" class="selectlist apex-item-select" data-native-menu="false" size="1" onchange="apex.submit('P1_TRACKER');"><option value="">Please select...</option>
<option value="SILVER-FLEX-BB-23-02-08" selected="selected">Tracker February 2023 v1</option>
<option value="SILVER-FLEX-22-11-25">Tracker Nov 2022 V1</option>
<option value="SILVER-VAR-22-10-21">Tracker Oct 2022 V1</option>
<option value="SILVER-22-08-31">Tracker Aug 2022 V1</option>
<option value="SILVER-22-07-22">Tracker Jul 2022 V1</option>
<option value="SILVER-22-04-25">Tracker V3 (Apr 2022)</option>
<option value="SILVER-2017-1">Tracker V1</option>
</select>

tracker formula (https://octopus.energy/tracker-faqs/) https://www.guylipman.com/octopus/formulas
bill calculator https://www.guylipman.com/octopus/bill_agile.html?startdate=2020-03-23&enddate=2020-03-31

get gsp:
https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=RG19

get all products
https://api.octopus.energy/v1/products/

get a month of agile tariff
https://api.octopus.energy/v1/products/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-A/standard-unit-rates/?page_size=1500

Phase 1
- live dashboard data for all tariffs
- set postcode for gsp (https://opennetzero.org/dataset/gis-boundaries-for-gb-grid-supply-points)
- comparision of current rate (no historical tariffs)
- tracker and agile

| header + postcode lookup |
| select       |
| elect | gas |
| trend        |
| different tariff |
| regional diff   |


Phase 2
- accept api key (note: override gsp via postcode)
- compare all traiffs


Phase 3
- forecast (https://opennetzero.org/dataset/oe-03782949-elexon_insights_14d_generation_forecast_summary   need saving to db)
- energy end use
*/
import { ReactNode, useContext, useState } from "react";

import { TRACKER } from "@/data/source";

import { UserContext } from "@/context/user";
import BrushChart from "../../components/octopus/BrushChart";
import PricePane from "../../components/octopus/PricePane";
import Remark from "../../components/octopus/Remark";
import TariffSelect from "../../components/octopus/TariffSelect";
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
      <div className="flex-0 text-lg text-center translate-y-3 text-accentPink-600">
        Electricity and Gas Unit Rates Over Time
        <Remark variant="badge">
          The current Government guaranteed price caps for electricity and gas
          shown here are for flexible plans only. All tracker plans have
          different price caps set at the time of joining the plan. Please refer
          to the table below.
        </Remark>
      </div>
      <section className="flex justify-center items-center gap-4 my-4">
        <BrushChart tariff={tariff} type="EG" gsp={gsp} />
      </section>
      <div className="flex-0 text-lg text-center translate-y-3 text-accentPink-600">
        Comparision of Octopus Tracker Plans
      </div>
      <section className="flex justify-center items-center gap-4 my-4 flex-col bg-black/20 rounded-lg p-4 lg:p-10">
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
      <div className="flex-0 text-lg text-center translate-y-3 text-accentPink-600">
        Current Unit Rates Around UK
        <Remark variant="badge">
          The unit rates for different parts of the UK is calcuated based on{" "}
          <a
            href="https://octopus.energy/tracker-faqs//#formula"
            target="_blank"
          >
            a set of formulae
          </a>
          .
        </Remark>
      </div>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChart tariff={tariff} type="E" gsp={gsp} />
        <MapChart tariff={tariff} type="G" gsp={gsp} />
      </section>
    </div>
  );
};

export default TrackerTariff;
