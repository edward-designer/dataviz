"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { UserContext } from "@/context/user";
import { IPeriod } from "@/data/source";
import useTypeTabs from "@/hooks/useTypeTabs";
import { getDatePeriod } from "@/utils/helpers";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";
import Notice from "./Notice";
import SavingPeriodSelector from "./SavingPeriodSelector";
import SavingsCalculationType from "./SavingsCalculationType";

import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import { PiSunDimFill } from "react-icons/pi";
import { TbBulb } from "react-icons/tb";

const SavingsCalculation = () => {
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<IPeriod>(getDatePeriod("year"));

  const { currentType, Tabs } = useTypeTabs();

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <div className="flex gap-2 md:flex-col lg:flex-row">
            <div className="flex-grow">
              Savings of current tariff vs Octopus Flexible (i.e. Ofgem Standard
              Variable Tariff), standing charges & VAT inclusive.
              <Remark>
                Approximations and assumptions are used in the calculations. The
                actual savings are likely to differ because of missing data and
                rounding. Also, please note the figures for the latest month may
                not be complete (maybe up to a few days earlier) as it takes
                time for your data to be updated. Kindly note that this page is
                still in beta version and may not be able to cater to all
                Octopus customer accounts. Should you encounter any issues while
                using this page, please contact Edward at{" "}
                <a
                  href="mailto:edward.chung.dev@gmail.com"
                  className="underline"
                >
                  edward.chung.dev@gmail.com
                </a>
                . Thanks a lot!
              </Remark>
            </div>
          </div>
          {false && (
            <SavingPeriodSelector period={period} setPeriod={setPeriod} />
          )}
          <Tabs />
          {currentType === "EE" && (
            <SavingsCalculationType
              deviceNumber={value.EMPAN}
              serialNumber={value.EESerialNo}
              currentContract={value.currentEEContract}
              previousContract={value.previousEEContract}
              gsp={value.gsp}
              period={period}
              agreements={value.agreementsEE}
              type="EE"
              apiKey={value.apiKey}
            >
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
                <PiSunDimFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Electricity Export Earnings
              </h2>
            </SavingsCalculationType>
          )}
          {currentType === "E" && (
            <SavingsCalculationType
              deviceNumber={value.MPAN}
              serialNumber={value.ESerialNo}
              currentContract={value.currentEContract}
              previousContract={value.previousEContract}
              gsp={value.gsp}
              period={period}
              agreements={value.agreementsE}
              type="E"
              apiKey={value.apiKey}
            >
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
                <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Electricity Savings
              </h2>
            </SavingsCalculationType>
          )}
          {currentType === "G" && (
            <SavingsCalculationType
              deviceNumber={value.MPRN}
              serialNumber={value.GSerialNo}
              currentContract={value.currentGContract}
              previousContract={value.previousGContract}
              gsp={value.gsp}
              period={period}
              agreements={value.agreementsG}
              type="G"
              apiKey={value.apiKey}
            >
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
                <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Gas Savings
              </h2>
            </SavingsCalculationType>
          )}
        </>
      )}
      <Notice>
        <TbBulb className="w-8 h-8 text-[#f8ec20] shrink-0" />
        <div>
          Wanna save even more? Use the brand new{" "}
          <Link
            href="/tariffHopping"
            className="text-accentPink-500 underline hover:text-accentBlue-500 hover:no-underline"
          >
            Tariff Hopping
          </Link>{" "}
          tool to optimize tariff switching throughout the year!
        </div>
      </Notice>
    </div>
  );
};

export default SavingsCalculation;
