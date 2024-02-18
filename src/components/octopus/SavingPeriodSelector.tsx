"use client";

import { IPeriod } from "@/data/source";
import { Dispatch, SetStateAction, useState } from "react";
import Remark from "./Remark";

import { TDuration, getDate, outOfAYear } from "@/utils/helpers";
import { DateRange } from "react-day-picker";
import { IoCaretBackOutline, IoCaretForward } from "react-icons/io5";
import { LiaCalendarAlt } from "react-icons/lia";
import { MdOutlineDoubleArrow } from "react-icons/md";

import DatePickerWithRange from "./DatePickerWithRange";
import SelectPeriodButton from "./SelectPeriodButton";

export const getDatePeriod = (duration: TDuration = "month") => {
  const from = new Date();
  const to = new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  from.setDate(1);

  return {
    duration,
    from,
    to,
  };
};

const SavingPeriodSelector = ({
  period,
  setPeriod,
  hasDaysOfWeek = false,
  daysOfWeek,
  setDaysOfWeek,
}: {
  period: IPeriod;
  setPeriod: Dispatch<SetStateAction<IPeriod>>;
  hasDaysOfWeek?: boolean;
  daysOfWeek?: number[];
  setDaysOfWeek?: Dispatch<SetStateAction<number[]>>;
}) => {
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

  const selectPeriodHandler = (duration: TDuration) => () => {
    setPeriod(getDatePeriod(duration));
  };

  return (
    <div className="flex flex-col gap-2 bg-black/50 p-2 md:p-4 text-sm md:text-base">
      <div className="flex gap-2 flex-col-reverse sm:flex-col lg:flex-row md:mb-2">
        <div className="flex items-center flex-grow text-lg md:text-xl gap-2 text-accentBlue-500">
          <LiaCalendarAlt className="w-6 h-6" />
          Smart Meter Data Period{" "}
          <Remark variant="heading">
            Only the most recent two tariffs are displayed for the
            &quot;Monthly&quot; selection.
          </Remark>
        </div>
      </div>
      <div className="flex justify-center lg:justify-start gap-x-2 gap-y-1">
        <SelectPeriodButton
          isActive={period.duration === "year"}
          clickHandler={selectPeriodHandler("year")}
        >
          Monthly
        </SelectPeriodButton>
        <SelectPeriodButton
          isActive={period.duration === "month"}
          clickHandler={selectPeriodHandler("month")}
        >
          Daily
        </SelectPeriodButton>
      </div>

      <div className="md:h-[40px] sm:w-full -mt-1">
        <div className="md:mt-1 flex sm:justify-start gap-2 items-center w-full justify-between sm:w-fit">
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

export default SavingPeriodSelector;
