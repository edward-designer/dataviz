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
    <div className="flex flex-col gap-2 bg-black/30 p-4">
      <div className="flex gap-2 flex-col-reverse sm:flex-col lg:flex-row mb-2">
        <div className="flex items-center flex-grow text-xl gap-2 text-accentBlue-500">
          <LiaCalendarAlt className="w-6 h-6" />
          Smart Meter Data Period{" "}
          <Remark>
            Only the most recent two tariffs are displayed for the
            &quot;Monthly&quot; selection and the most recent for
            &quot;Daily&quot;.
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
        {false && (
          <SelectPeriodButton
            isActive={period.duration === "custom"}
            clickHandler={() =>
              setPeriod((period) => ({ ...period, duration: "custom" }))
            }
          >
            Custom
          </SelectPeriodButton>
        )}
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

      <div className="h-[40px] sm:w-full mt-0 md:-mt-1">
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

export default SavingPeriodSelector;
