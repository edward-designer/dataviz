"use client";

import { IPeriod } from "@/data/source";
import { Dispatch, SetStateAction, useState } from "react";

import { TDuration, getDate, outOfAYear } from "@/utils/helpers";
import { DateRange } from "react-day-picker";
import { IoCaretBackOutline, IoCaretForward } from "react-icons/io5";
import { LiaCalendarAlt } from "react-icons/lia";

import DatePickerWithRange from "./DatePickerWithRange";

export const getDatePeriod = (duration: TDuration = "month") => {
  const from = new Date();
  const to = new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  if (duration === "month") {
    from.setDate(1);
    from.setMonth(from.getMonth() - 1);
    to.setDate(1);
    to.setDate(to.getDate() - 1);
  }
  if (duration === "week") {
    const dayOfWeek = from.getDay();
    from.setDate(from.getDate() - dayOfWeek - 7);
    to.setDate(from.getDate() + 6);
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
      fromDate.setDate(1);
      fromDate.setMonth(
        earlier ? fromDate.getMonth() - 1 : fromDate.getMonth() + 1
      );
      toDate.setDate(1);
      if (!earlier) {
        toDate.setMonth(toDate.getMonth() + 2);
      }
      toDate.setDate(toDate.getDate() - 1);
    }
    if (duration === "week") {
      fromDate.setDate(
        earlier ? fromDate.getDate() - 7 : fromDate.getDate() + 7
      );
      toDate.setDate(earlier ? toDate.getDate() - 7 : toDate.getDate() + 7);
    }
    toDate.setHours(23, 59, 59, 999);
    setPeriod({
      ...period,
      to: toDate,
      from: fromDate,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-col-reverse sm:flex-col lg:flex-row mb-2">
        <div className="flex items-center flex-grow text-xl gap-2 text-accentBlue-500">
          <LiaCalendarAlt className="w-6 h-6" />
          Smart Meter Data Period
        </div>
      </div>

      <div className="h-[56px] sm:w-full mt-0 md:-mt-1">
        <div className="mt-1 flex sm:justify-start gap-2 items-center w-full justify-between sm:w-fit">
          <button
            onClick={() => getPeriod(true)}
            disabled={outOfAYear(period.from)}
            className="disabled:opacity-30"
          >
            <IoCaretBackOutline className="w-8 h-8" />
          </button>
          <div className="text-center min-w-[210px] grow sm:grow-0">{`${period.from.toLocaleDateString(
            "en-GB"
          )} - ${period.to.toLocaleDateString("en-GB")}`}</div>
          <button
            onClick={() => getPeriod(false)}
            disabled={outOfAYear(period.to)}
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
