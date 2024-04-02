"use client";

import { IPeriod } from "@/data/source";
import { Dispatch, SetStateAction, useState } from "react";

import {
  TDuration,
  getDate,
  outOfAYear,
  toLocaleUTCDateString,
} from "@/utils/helpers";
import { DateRange } from "react-day-picker";
import { IoCaretBackOutline, IoCaretForward } from "react-icons/io5";
import { LiaCalendarAlt } from "react-icons/lia";

import DatePickerWithRange from "./DatePickerWithRange";

export const getDatePeriod = (duration: TDuration = "month") => {
  const from = new Date();
  const to = new Date();
  from.setUTCHours(0, 0, 0, 0);

  to.setUTCHours(22, 59, 59, 999);
  if (duration === "month") {
    from.setUTCDate(1);
    from.setUTCMonth(from.getUTCMonth() - 1);
    to.setUTCDate(1);
    to.setUTCDate(to.getUTCDate() - 1);
  }
  if (duration === "week") {
    const dayOfWeek = from.getUTCDay();
    from.setUTCDate(from.getUTCDate() - dayOfWeek - 7);
    to.setUTCDate(from.getUTCDate() + 6);
  }

  return {
    duration,
    from,
    to,
  };
};

const PeriodMonthSelector = ({
  period,
  setPeriod,
}: {
  period: IPeriod;
  setPeriod: Dispatch<SetStateAction<IPeriod>>;
  hasDaysOfWeek?: boolean;
  daysOfWeek?: number[];
  setDaysOfWeek?: Dispatch<SetStateAction<number[]>>;
}) => {
  const selectPeriodHandler = (duration: TDuration) => () => {
    setPeriod(getDatePeriod(duration));
  };

  const getPeriod = (earlier = true) => {
    const { to, from, duration } = period;
    if (duration === "custom") return;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (duration === "month") {
      fromDate.setUTCDate(1);
      fromDate.setUTCMonth(
        earlier ? fromDate.getUTCMonth() - 1 : fromDate.getUTCMonth() + 1
      );
      toDate.setUTCDate(1);
      if (!earlier) {
        toDate.setUTCMonth(toDate.getUTCMonth() + 2);
      }
      toDate.setUTCDate(toDate.getUTCDate() - 1);
    }
    if (duration === "week") {
      fromDate.setUTCDate(
        earlier ? fromDate.getUTCDate() - 7 : fromDate.getUTCDate() + 7
      );
      toDate.setUTCDate(
        earlier ? toDate.getUTCDate() - 7 : toDate.getUTCDate() + 7
      );
    }
    toDate.setUTCHours(23, 59, 59, 999);
    setPeriod({
      ...period,
      to: toDate,
      from: fromDate,
    });
  };

  console.log(period);
  return (
    <div className="flex flex-col gap-2 bg-black/50 p-2 md:p-4 text-sm md:text-base w-full">
      <div className="flex gap-2 flex-col-reverse sm:flex-col lg:flex-row md:mb-2">
        <div className="flex items-center flex-grow text-lg md:text-xl gap-2 text-accentBlue-500">
          <LiaCalendarAlt className="w-6 h-6" />
          Smart Meter Data Period
        </div>
      </div>

      <div className="md:h-[40px] sm:w-full -mt-1">
        <div className="mt-1 flex sm:justify-start gap-2 items-center w-full justify-between sm:w-fit">
          <button
            onClick={() => getPeriod(true)}
            disabled={outOfAYear(period.from, true)}
            className="disabled:opacity-30"
          >
            <IoCaretBackOutline className="w-8 h-8" />
          </button>
          <div className="text-center min-w-[210px] grow sm:grow-0">{`${toLocaleUTCDateString(
            period.from,
            "en-GB"
          )} - ${toLocaleUTCDateString(period.to, "en-GB")}`}</div>
          <button
            onClick={() => getPeriod(false)}
            disabled={outOfAYear(period.to, false)}
            className="disabled:opacity-30"
          >
            <IoCaretForward className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodMonthSelector;
