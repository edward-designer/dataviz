"use client";

import { UserContext } from "@/context/user";
import {
  ETARIFFS,
  GTARIFFS,
  IUserApiResult,
  TariffCategory,
} from "@/data/source";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";
import Remark from "./Remark";
import TariffComparisionCard from "./TariffComparisionCard";

import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import AddATariff from "./AddATariffToCompare";
import TariffDetails from "./TariffDetails";
import { AnimatePresence } from "framer-motion";
import { TDuration, getCategory, getDate, outOfAYear } from "@/utils/helpers";
import SelectPeriodButton from "./SelectPeriodButton";
import { IoCaretForward, IoCaretBackOutline } from "react-icons/io5";
import DatePickerWithRange from "./DatePickerWithRange";
import { DateRange } from "react-day-picker";

const UserApiResult = () => {
  const { value } = useContext(UserContext);
  const [tariffsEToCompare, setTariffsEToCompare] = useState(
    ETARIFFS.slice(0, 3)
  );
  const [tariffsGToCompare, setTariffsGToCompare] = useState(GTARIFFS);

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
  const [period, setPeriod] = useState<{
    duration: TDuration | "custom";
    from: Date;
    to: Date;
  }>(getDatePeriod);

  const addToTariff = (tariffToAdd: (typeof ETARIFFS)[number]["tariff"]) => {
    setTariffsEToCompare((tariffsEToCompare) => {
      const newTariff = ETARIFFS.find(
        (tariff) => tariff.tariff === tariffToAdd
      );
      if (newTariff) return [...tariffsEToCompare, newTariff];
      return tariffsEToCompare;
    });
  };
  const setECost = useCallback(
    (category: TariffCategory, cost: number) =>
      setTariffsEToCompare((value) =>
        value.map((tariffSet) => {
          if (tariffSet.category === category) {
            return { ...tariffSet, cost };
          }
          return tariffSet;
        })
      ),
    []
  );
  const setGCost = useCallback(
    (category: TariffCategory, cost: number) =>
      setTariffsGToCompare((value) =>
        value.map((tariffSet) => {
          if (tariffSet.category === category) {
            return { ...tariffSet, cost };
          }
          return tariffSet;
        })
      ),
    []
  );

  const SVTECost =
    tariffsEToCompare.find((tariffSet) => tariffSet.category === "SVT")?.cost ??
    null;
  const SVTGCost =
    tariffsGToCompare.find((tariffSet) => tariffSet.category === "SVT")?.cost ??
    null;

  const tariffsEWithResultsCount = tariffsEToCompare.filter(
    (tariff) => tariff.cost !== 0
  ).length;

  const reOrderedTariffsEToCompare = [...tariffsEToCompare].sort(
    (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity)
  );

  const tariffsGWithResultsCount = tariffsGToCompare.filter(
    (tariff) => tariff.cost !== 0
  ).length;

  const reOrderedTariffsGToCompare = [...tariffsGToCompare].sort(
    (a, b) => (a.cost ?? Infinity) - (b.cost ?? Infinity)
  );

  const remainingTariffs = [...ETARIFFS].filter(
    (tariff) =>
      !tariffsEToCompare.map((tariff) => tariff.tariff).includes(tariff.tariff)
  );

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
    setTariffsEToCompare((tariffsEToCompare) =>
      tariffsEToCompare.map((tariff) =>
        tariff.category === "SVT" ? { ...tariff, cost: null } : tariff
      )
    );
    setTariffsGToCompare((tariffsGToCompare) =>
      tariffsGToCompare.map((tariff) =>
        tariff.category === "SVT" ? { ...tariff, cost: null } : tariff
      )
    );
  };

  useEffect(() => {
    if (!value.currentETariff) return;
    if (
      tariffsEToCompare.some((tariff) => tariff.tariff === value.currentETariff)
    )
      return;

    const currentTariffCategory = getCategory(value.currentETariff);

    setTariffsEToCompare((tariffs) => [
      ...tariffs.filter((tariff) => tariff.category !== currentTariffCategory),
      {
        tariff: value.currentETariff,
        type: "E",
        category: currentTariffCategory,
        cost: null,
      },
    ]);
  }, [tariffsEToCompare, value.currentETariff]);

  return (
    <div className="flex gap-4 flex-col relative">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <div className="flex gap-2 items-center  flex-col-reverse md:flex-col lg:flex-row">
            <div className="flex-grow">
              Comparison of tariffs based on your actual energy use data.
              Selecting a longer period will provide more accurate comparisions.{" "}
              <i>Remember: Past results do not guarantee future performance.</i>
              <Remark>
                <em>
                  [Notes: Currently Octopus Flux Export tariffs are NOT included
                  in the calculations.]
                </em>{" "}
                The figures presented here are an approximation of your annual
                energy costs. If you have not been with Octopus for over a year,
                the costs here will be proportionally expanded to one full year.
                However, this would make the costs less reflective of the
                year-round conditions. Approximations and assumptions are used
                in the calculations. The actual costs may vary a lot depending
                on the prevailing unit rates and change of energy usage
                patterns.
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
          <div className="h-[60px]">
            {period.duration !== "custom" ? (
              <div className="mt-1 flex justify-start gap-2 items-center">
                <button
                  onClick={() => getPeriod(true)}
                  disabled={outOfAYear(period.from)}
                  className="disabled:opacity-30"
                >
                  <IoCaretBackOutline className="w-8 h-8" />
                </button>
                <div className="text-center min-w-[210px]">{`${period.from.toLocaleDateString()} - ${period.to.toLocaleDateString()}`}</div>
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
          {value.MPAN && value.ESerialNo && value.currentEContract && (
            <>
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-4">
                <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Electricity
              </h2>
              <TariffDetails
                valid_from={value.currentEContract.valid_from}
                tariff_code={value.currentETariff}
                type="E"
              />
              <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
                <AnimatePresence>
                  {reOrderedTariffsEToCompare.map(
                    ({ tariff, category }, ind) => {
                      return (
                        <TariffComparisionCard
                          key={category}
                          type="E"
                          deviceNumber={value.MPAN}
                          serialNo={value.ESerialNo}
                          tariff={tariff}
                          category={category}
                          fromDate={period.from.toISOString()}
                          toDate={period.to.toISOString()}
                          compareTo={SVTECost}
                          setCost={setECost}
                          rank={ind + 1}
                        />
                      );
                    }
                  )}
                  {remainingTariffs.length > 0 && (
                    <div
                      className={`basis-full lg:basis-[32%] xl:basis-[32.5%] relative border border-dashed border-white/30 min-h-[200px] lg:h-[300px] rounded-2xl flex flex-col justify-center items-center gap-2 bg-cover bg-tops`}
                    >
                      <AddATariff
                        tariffs={remainingTariffs}
                        addToTariff={addToTariff}
                      />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
          {value.MPRN && value.GSerialNo && value.currentGContract && (
            <>
              <h2 className="font-display text-accentPink-500 text-4xl flex items-center mt-8">
                <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
                Gas
              </h2>
              <TariffDetails
                valid_from={value.currentGContract.valid_from}
                tariff_code={value.currentGTariff}
                type="G"
              />
              <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
                <AnimatePresence>
                  {reOrderedTariffsGToCompare.map(
                    ({ tariff, cost, category }, ind) => {
                      return (
                        <TariffComparisionCard
                          key={category}
                          type="G"
                          deviceNumber={value.MPRN}
                          serialNo={value.GSerialNo}
                          tariff={tariff}
                          category={category}
                          fromDate={period.from.toISOString()}
                          toDate={period.to.toISOString()}
                          compareTo={SVTGCost}
                          setCost={setGCost}
                          rank={ind + 1}
                        />
                      );
                    }
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserApiResult;
