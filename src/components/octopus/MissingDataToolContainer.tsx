"use client";

import { UserContext } from "@/context/user";
import { useContext, useRef, useState } from "react";

import PeriodMonthSelector, { getDatePeriod } from "./PeriodMonthSelector";

import Loading from "@/app/loading";

import { TbChartInfographic, TbZoomMoney } from "react-icons/tb";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";

import { IPeriod } from "@/data/source";
import useConsumptionData from "@/hooks/useConsumptionData";
import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import { PiSunDimFill } from "react-icons/pi";
import MissingDataToolChart from "./MissingDataToolChart";
import Button from "./Button";

export type ErrorType = Record<string, string>;

const MissingDataToolContainer = () => {
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<IPeriod>(getDatePeriod("month"));

  const [currentType, setCurrentType] = useState<"E" | "G" | "EE">("E");

  const hasEImport = !!(value.ESerialNo && value.MPAN);
  const hasEExport = !!(value.EESerialNo && value.EMPAN);
  const hasGImport = !!(value.GSerialNo && value.MPAN);

  const toDate = new Date(new Date().setDate(new Date().getDate() - 1)); // yesterday
  toDate.setHours(23, 59, 59, 999);

  const fromDate = new Date(new Date().setFullYear(toDate.getFullYear() - 1)); // 1st of Month of 1 year before
  fromDate.setDate(1);
  fromDate.setHours(0, 0, 0, 0);

  /* get data from API */
  const { data: dataEImport, isLoading } = useConsumptionData({
    fromISODate: fromDate.toISOString(),
    toISODate: toDate.toISOString(),
    type: "E",
    category: "Agile",
    deviceNumber: value.MPAN,
    serialNo: value.ESerialNo,
    apiKey: value.apiKey,
  });

  const { data: dataEExport } = useConsumptionData({
    fromISODate: fromDate.toISOString(),
    toISODate: toDate.toISOString(),
    type: "E",
    category: "Agile",
    deviceNumber: value.EMPAN,
    serialNo: value.EESerialNo,
    apiKey: value.apiKey,
  });

  const { data: dataGImport } = useConsumptionData({
    fromISODate: fromDate.toISOString(),
    toISODate: toDate.toISOString(),
    type: "G",
    category: "Agile",
    deviceNumber: value.MPRN,
    serialNo: value.GSerialNo,
    apiKey: value.apiKey,
  });

  const fromDateWithin1Year =
    new Date(period.from).valueOf() < new Date(fromDate).valueOf()
      ? fromDate
      : period.from;
  const toDateWithin1Year =
    new Date(period.to).valueOf() > new Date(toDate).valueOf()
      ? toDate
      : period.to;

  /* loading while waiting */
  if (hasEImport && !dataEImport) return <Loading />;
  if (hasEExport && !dataEExport) return <Loading />;
  if (hasGImport && !dataGImport) return <Loading />;

  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex items-start flex-wrap">
        <PeriodMonthSelector
          period={period}
          setPeriod={setPeriod}
          hasDaysOfWeek={true}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex pl-6 z-30 sticky top-0 pt-4 bg-theme-950/70 backdrop-blur-md border-b border-accentPink-900">
          {hasEExport && (
            <Button
              className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
                currentType === "EE"
                  ? " border-accentPink-500 bg-accentPink-600 text-white"
                  : "border-slate-300 hover:text-accentPink-500 hover:border-accentPink-500"
              }`}
              clickHandler={() => setCurrentType("EE")}
            >
              Electricity (Export)
            </Button>
          )}
          {hasEImport && (
            <Button
              className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
                currentType === "E"
                  ? " border-accentPink-500 bg-accentPink-600 text-white"
                  : "border-slate-300 hover:text-accentPink-500 hover:border-accentPink-500"
              }`}
              clickHandler={() => setCurrentType("E")}
            >
              Electricity
            </Button>
          )}
          {hasGImport && (
            <Button
              className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
                currentType === "G"
                  ? " border-accentPink-500 bg-accentPink-600 text-white"
                  : "border-slate-300 hover:text-accentPink-500 hover:border-accentPink-500"
              }`}
              clickHandler={() => setCurrentType("G")}
            >
              Gas
            </Button>
          )}
        </div>
        <div className="flex w-full border-l border-r border-b border-accentPink-900 rounded-b-xl p-6">
          {currentType === "EE" && (
            <MissingDataToolChart
              fromDate={fromDateWithin1Year}
              toDate={toDateWithin1Year}
              data={dataEExport}
              type="EE"
              contractFrom={value.contractEEStartDate}
            >
              <PiSunDimFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity (export) Smart Meter Data
            </MissingDataToolChart>
          )}
          {currentType === "E" && (
            <MissingDataToolChart
              fromDate={fromDateWithin1Year}
              toDate={toDateWithin1Year}
              data={dataEImport}
              type="E"
              contractFrom={value.contractEStartDate}
            >
              <BsLightningChargeFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Electricity Smart Meter Data
            </MissingDataToolChart>
          )}
          {currentType === "G" && (
            <MissingDataToolChart
              fromDate={fromDateWithin1Year}
              toDate={toDateWithin1Year}
              data={dataGImport}
              type="G"
              contractFrom={value.contractGStartDate}
            >
              <AiFillFire className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
              Gas Smart Meter Data
            </MissingDataToolChart>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissingDataToolContainer;
