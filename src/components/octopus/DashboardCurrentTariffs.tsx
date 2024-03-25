"use client";

import { UserContext } from "@/context/user";
import { useContext, useState } from "react";

import { FaTachometerAlt } from "react-icons/fa";
import DashboardTariffDetails from "./DashboardTariffDetails";
import { BsLightningChargeFill } from "react-icons/bs";
import { AiFillFire } from "react-icons/ai";
import { PiSunDimFill } from "react-icons/pi";

const DashboardCurrentTariff = () => {
  const { value } = useContext(UserContext);

  return (
    <div className="flex flex-col gap-6 flex-1 basis-8/12">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3">
        <FaTachometerAlt className="w-8 h-8" />
        Current Tariffs
      </h2>
      <div className="font-normal flex flex-col gap-8">
        {value.currentEEContract && (
          <div>
            <div className="text-accentPink-700 text-2xl">
              <PiSunDimFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity (export)
            </div>
            <DashboardTariffDetails
              valid_to={value.currentEEContract.valid_to}
              valid_from={value.currentEEContract.valid_from}
              tariff_code={value.currentEETariff}
              type="E"
            />
          </div>
        )}
        {value.currentEContract && (
          <div>
            <div className="text-accentPink-700 text-2xl">
              <BsLightningChargeFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity
            </div>
            <DashboardTariffDetails
              valid_to={value.currentEContract.valid_to}
              valid_from={value.currentEContract.valid_from}
              tariff_code={value.currentETariff}
              type="E"
              dual={!!value.currentEContract?.tariff_code.includes("E-2R")}
            />
          </div>
        )}
        {value.currentGContract && (
          <div>
            <div className="text-accentPink-700 text-2xl">
              <AiFillFire className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Gas
            </div>
            <DashboardTariffDetails
              valid_to={value.currentGContract.valid_to}
              valid_from={value.currentGContract.valid_from}
              tariff_code={value.currentGTariff}
              type="G"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCurrentTariff;
