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

const weekName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDatePeriod = (duration: TDuration = "year") => {
  const today = new Date();
  const from = getDate(today, duration, true);
  const to = getDate(getDate(from, duration, false), "day", true);
  to.setHours(23, 59, 59, 999);
  return {
    duration,
    from,
    to,
  };
};

const PeriodSelector = ({
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
    const toDate = getDate(to, duration, earlier);
    const fromDate = getDate(from, duration, earlier);
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
          Smart Meter Data Period
          <Remark variant="heading">
            Selecting a longer period will provide more accurate comparisons.
            The figures presented here are an approximation of your annual
            energy costs. If you have not been with Octopus for over a year, the
            costs here will be proportionally expanded to one full year.
            However, this would make the costs less reflective of the year-round
            conditions. Approximations and assumptions are used in the
            calculations. The actual costs may vary a lot depending on the
            prevailing unit rates and change of energy usage patterns.
          </Remark>
        </div>
      </div>
      <div className="flex justify-center lg:justify-start gap-x-2 gap-y-1">
        <SelectPeriodButton
          isActive={period.duration === "year"}
          clickHandler={selectPeriodHandler("year")}
        >
          Yearly
        </SelectPeriodButton>
        <SelectPeriodButton
          isActive={period.duration === "month"}
          clickHandler={selectPeriodHandler("month")}
        >
          Monthly
        </SelectPeriodButton>
        <SelectPeriodButton
          isActive={period.duration === "week"}
          clickHandler={selectPeriodHandler("week")}
        >
          Weekly
        </SelectPeriodButton>
        <SelectPeriodButton
          isActive={period.duration === "custom"}
          clickHandler={() =>
            setPeriod((period) => ({ ...period, duration: "custom" }))
          }
        >
          Custom
        </SelectPeriodButton>
        {hasDaysOfWeek && setDaysOfWeek && daysOfWeek && (
          <>
            <div className="md:flex items-center self-stretch hidden">
              <MdOutlineDoubleArrow className="h-4 w-4" />
            </div>
            <div className="flex flex-row items-center gap-3 text-xs mt-1">
              {weekName.map((day, i) => (
                <button
                  key={day}
                  onClick={() =>
                    setDaysOfWeek((prevDaysOfWeek) => {
                      if (
                        prevDaysOfWeek.includes(i) &&
                        prevDaysOfWeek.length < 2
                      )
                        return [0, 1, 2, 3, 4, 5, 6];
                      return prevDaysOfWeek.includes(i)
                        ? [...prevDaysOfWeek].filter((day) => day !== i)
                        : [...prevDaysOfWeek, i];
                    })
                  }
                  className={`p-2 border rounded-xl ${
                    daysOfWeek.includes(i)
                      ? "text-accentPink-500 border-accentPink-500 bg-accentPink-900/30"
                      : "hover:text-accentPink-500 hover:border-accentPink-500 border-slate-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="md:h-[40px] sm:w-full md:-mt-1">
        {period.duration !== "custom" ? (
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
        ) : (
          <DatePickerWithRange
            date={period}
            setDate={(dateRange: DateRange | undefined) => {
              if (!dateRange) return;
              let { from, to } = dateRange;
              if (typeof from === "undefined" && typeof to === "undefined")
                return;
              if (typeof from === "undefined" && to instanceof Date) {
                from = new Date(to);
              }
              if (typeof to === "undefined" && from instanceof Date) {
                to = new Date(from);
              }
              if (from instanceof Date && to instanceof Date) {
                from.setHours(0, 0, 0, 0);
                to.setHours(23, 59, 59, 999);
                setPeriod({ ...period, from, to });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PeriodSelector;
