import { TContract, UserContext } from "@/context/user";
import React, { PropsWithChildren, useContext } from "react";
import EarningChart from "./EarningChart";
import TariffDetails from "./TariffDetails";
import { PiSunDimFill } from "react-icons/pi";
import { IMeterPointE, IPeriod, TariffType } from "@/data/source";
import SavingsChart from "./SavingsChart";
import { getCategory, getTariffCodeWithoutPrefixSuffix } from "@/utils/helpers";
import Link from "next/link";
import SavingsChartDaily from "./SavingsChartDaily";
import EarningChartDaily from "./EarningChartDaily";

interface ISavingsCalculatorType extends PropsWithChildren {
  deviceNumber: string;
  serialNumber: string;
  currentContract: TContract;
  previousContract: TContract;
  gsp: string;
  period: IPeriod;
  type: "E" | "G" | "EE";
  agreements: IMeterPointE["agreements"] | undefined;
  apiKey: string;
  testRun?: boolean;
}

const SavingsCalculationType = ({
  deviceNumber,
  serialNumber,
  currentContract,
  previousContract,
  gsp,
  period,
  type,
  agreements,
  children,
  apiKey,
  testRun = false,
}: ISavingsCalculatorType) => {
  const energyType = type === "EE" ? "E" : type;
  const isCurrentSVT =
    getCategory(currentContract?.tariff_code ?? "") === "SVT";
  const isPreviousSVT =
    getCategory(previousContract?.tariff_code ?? "") === "SVT";

  const oneYearEarlier = new Date(
    new Date(new Date().setHours(0, 0, 0, 0)).setFullYear(
      new Date().getFullYear() - 1
    )
  ).toISOString();

  // shows a max of 1 year data
  let currentFromDate = "";
  if (typeof currentContract !== "undefined") {
    currentFromDate =
      new Date(currentContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : currentContract.valid_from;
  }
  let previousFromDate = "";
  if (typeof previousContract !== "undefined") {
    previousFromDate =
      new Date(previousContract.valid_from) < new Date(oneYearEarlier)
        ? oneYearEarlier
        : previousContract.valid_from;
  }

  if (!agreements) return;

  const dualCurrent = currentContract?.tariff_code.includes("E-2R");
  const dualPrevious = previousContract?.tariff_code.includes("E-2R");

  //if (type === "EE") console.log(currentFromDate);

  return (
    <div className="flex flex-col gap-4">
      {((deviceNumber && serialNumber) || testRun) &&
        typeof currentContract !== "undefined" && (
          <>
            <div className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
              {children}
            </div>
            {period.duration === "year" && (
              <TariffDetails
                valid_from={currentContract.valid_from}
                valid_to={currentContract?.valid_to}
                tariff_code={currentContract.tariff_code}
                type={energyType}
                dual={dualCurrent}
              />
            )}
            {type === "EE" ? (
              period.duration === "year" ? (
                <EarningChart
                  tariff={getTariffCodeWithoutPrefixSuffix(
                    currentContract.tariff_code
                  )}
                  fromDate={currentFromDate}
                  gsp={gsp}
                  type={energyType}
                  deviceNumber={deviceNumber}
                  serialNo={serialNumber}
                />
              ) : (
                <EarningChartDaily
                  period={period}
                  agreements={agreements}
                  gsp={gsp}
                  type={energyType}
                  deviceNumber={deviceNumber}
                  serialNo={serialNumber}
                  compareTo=""
                  apiKey={apiKey}
                />
              )
            ) : isCurrentSVT && !dualCurrent ? (
              <div>
                You are currently on the Octopus Flexible Tariff.{" "}
                <Link href="/compare">
                  Check how you can save more on your energy bill!
                </Link>
              </div>
            ) : period.duration === "year" ? (
              <SavingsChart
                tariff={getTariffCodeWithoutPrefixSuffix(
                  currentContract.tariff_code
                )}
                fromDate={currentFromDate}
                gsp={gsp}
                type={energyType}
                deviceNumber={deviceNumber}
                serialNo={serialNumber}
                compareTo="SVT"
                dual={dualCurrent}
                testRun={testRun}
              />
            ) : (
              <SavingsChartDaily
                period={period}
                agreements={agreements}
                gsp={gsp}
                type={energyType}
                deviceNumber={deviceNumber}
                serialNo={serialNumber}
                compareTo="SVT"
                apiKey={apiKey}
                dual={dualCurrent}
                testRun={testRun}
              />
            )}
          </>
        )}
      {deviceNumber &&
        serialNumber &&
        typeof previousContract !== "undefined" &&
        period.duration === "year" && (
          <>
            <TariffDetails
              valid_from={previousContract.valid_from}
              valid_to={previousContract.valid_to!}
              tariff_code={previousContract.tariff_code}
              type={energyType}
              isCurrent={false}
              dual={dualPrevious}
            />
            {type === "EE" ? (
              <EarningChart
                tariff={getTariffCodeWithoutPrefixSuffix(
                  previousContract.tariff_code
                )}
                fromDate={previousFromDate}
                contractToDate={previousContract.valid_to!}
                gsp={gsp}
                type={energyType}
                deviceNumber={deviceNumber}
                serialNo={serialNumber}
              />
            ) : isPreviousSVT ? (
              <div>You were on Flexible Tariff (SVT).</div>
            ) : (
              <SavingsChart
                tariff={getTariffCodeWithoutPrefixSuffix(
                  previousContract.tariff_code
                )}
                fromDate={previousFromDate}
                contractToDate={previousContract.valid_to!}
                gsp={gsp}
                type={energyType}
                deviceNumber={deviceNumber}
                serialNo={serialNumber}
                compareTo="SVT"
                dual={dualCurrent}
              />
            )}
          </>
        )}
    </div>
  );
};

export default SavingsCalculationType;
