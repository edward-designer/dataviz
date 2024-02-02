"use client";

import { IPeriod } from "@/data/source";
import { Dispatch, SetStateAction } from "react";
import Remark from "./Remark";

import { TDuration, getDate, outOfAYear } from "@/utils/helpers";
import { DateRange } from "react-day-picker";
import { IoCaretBackOutline, IoCaretForward } from "react-icons/io5";
import DatePickerWithRange from "./DatePickerWithRange";
import SelectPeriodButton from "./SelectPeriodButton";

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
}: {
  period: IPeriod;
  setPeriod: Dispatch<SetStateAction<IPeriod>>;
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
    <>
      <div className="flex gap-2 flex-col-reverse sm:flex-col lg:flex-row">
        <div className="flex-grow">
          Selecting a longer period will provide more accurate comparisons.
          <Remark>
            <em>
              [<strong>Note:</strong> With the price increase for Agile/Tracker
              tariffs in Dec 2023, the comparison prices shown here are now
              based on the NEW increased Agile/Tracker formulae unless you are a
              current Agile/Tracker user.]
            </em>{" "}
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
      <div className="flex justify-start gap-4">
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
      </div>
      <div className="h-[60px] sm:w-full">
        {period.duration !== "custom" ? (
          <div className="mt-1 flex sm:justify-start gap-2 items-center w-full justify-between sm:w-fit">
            <button
              onClick={() => getPeriod(true)}
              disabled={outOfAYear(period.from)}
              className="disabled:opacity-30"
            >
              <IoCaretBackOutline className="w-8 h-8" />
            </button>
            <div className="text-center min-w-[210px] grow sm:grow-0">{`${period.from.toLocaleDateString()} - ${period.to.toLocaleDateString()}`}</div>
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
    </>
  );
};

export default PeriodSelector;
