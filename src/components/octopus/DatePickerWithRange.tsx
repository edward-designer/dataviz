"use client";

import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDate } from "@/utils/helpers";

interface IDatePickerWitfhRange {
  date: {
    from: Date;
    to: Date;
  };
  setDate: (dateRange: DateRange | undefined) => void;
}

const DatePickerWitfhRange = ({ date, setDate }: IDatePickerWitfhRange) => {
  return (
    <div className={cn("grid ")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[290px] justify-center font-sans text-lg font-thin",
              !date && "text-muted-foreground"
            )}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/y")} - {format(date.to, "dd/MM/y")}
                </>
              ) : (
                format(date.from, "dd/MM/y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={[
              {
                from: new Date(),
                to: getDate(new Date(), "year", false),
              },
              {
                from: getDate(getDate(new Date(), "year", true), "day", true),
                to: getDate(getDate(new Date(), "year", true), "year", true),
              },
            ]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePickerWitfhRange;
