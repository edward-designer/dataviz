"use client";

import MapChartChange from "./MapChartChange";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";
import SavingsChart from "./SavingsChart";
import TariffDetails from "./TariffDetails";

import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import { useContext } from "react";
import { UserContext } from "@/context/user";

const TrackerComparision = () => {
  const { value, setValue } = useContext(UserContext);

  return (
    <div className="flex gap-4 flex-col relative">
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600 mt-10">
        Regional energy unit rates increase
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChartChange
          tariff="SILVER-24-04-03"
          compareTo="SILVER-23-12-06"
          type="E"
          gsp={value.gsp}
        />
        <MapChartChange
          tariff="SILVER-24-04-03"
          compareTo="SILVER-23-12-06"
          type="G"
          gsp={value.gsp}
        />
      </section>
      <h2 className="flex-0 text-lg font-bold text-center translate-y-3 text-accentPink-600">
        Regional standing charges increase
      </h2>
      <section className="flex flex-col sm:flex-row items-stretch sm:justify-center sm:items-center gap-4 my-4">
        <MapChartChange
          tariff="SILVER-24-04-03"
          compareTo="SILVER-23-12-06"
          type="E"
          gsp={value.gsp}
          rate="standing_charge_inc_vat"
        />
        <MapChartChange
          tariff="SILVER-24-04-03"
          compareTo="SILVER-23-12-06"
          type="G"
          gsp={value.gsp}
          rate="standing_charge_inc_vat"
        />
      </section>
    </div>
  );
};

export default TrackerComparision;
