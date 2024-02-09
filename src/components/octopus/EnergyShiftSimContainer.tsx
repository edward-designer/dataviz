"use client";

import SliderVertical from "@/components/ui/sliderVertical";
import { UserContext } from "@/context/user";
import useConsumptionPattern from "@/hooks/useConsumptionPattern";
import {
  TDuration,
  capitalize,
  daysDiff,
  evenRound,
  getCategory,
  getDatePeriod,
} from "@/utils/helpers";
import { max, median } from "d3";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import useTariffQueryAverage from "@/hooks/useTariffQueryAverage";
import EnergyShiftSimEnergyCounter from "./EnergyShiftSimEnergyCounter";
import FormBattery from "./FormBattery";
import FormSolar from "./FormSolar";
import PeriodSelector from "./PeriodSelector";

import Loading from "@/app/loading";

import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { TbSunElectricity, TbZoomMoney } from "react-icons/tb";
import { TbChartInfographic } from "react-icons/tb";
import { AiOutlineLoading } from "react-icons/ai";

import { EETARIFFS, ETARIFFS } from "@/data/source";
import EnergyShiftSimCostContainer from "./EnergyShiftSimCostContainer";
import EnergyShiftSimTariffSelector from "./EnergyShiftSimTariffSelector";
import SimpleLoading from "./SimpleLoading";

export type ErrorType = Record<string, string>;

export interface IConsumptionData {
  count: number;
  consumption: number;
}

const EnergyShiftSimContainer = () => {
  /* states */
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<{
    duration: TDuration | "custom";
    from: Date;
    to: Date;
  }>(getDatePeriod);
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);

  const [adjustedConsumption, setAdjustedConsumption] = useState<
    IConsumptionData[]
  >([]);
  const [adjustedExport, setAdjustedExport] = useState<IConsumptionData[]>([]);

  const [importTariff, setImportTariff] = useState<string>("");
  const [exportTariff, setExportTariff] = useState<string>("");

  const [hasExport, setHasExport] = useState(false);

  const [batteryFormOpen, setBatteryFormOpen] = useState(false);
  const [solarFormOpen, setSolarFormOpen] = useState(false);

  const cost = useRef<undefined | number>(undefined);
  const earning = useRef<undefined | number>(undefined);

  /* derived states */
  const isExporting = !!(value.EESerialNo && value.EMPAN);

  const importTariffs = [...ETARIFFS];
  if (
    value.currentETariff &&
    !importTariffs.some((tariff) => tariff.tariff === value.currentETariff)
  )
    importTariffs.push({
      tariff: value.currentETariff,
      type: "E",
      category: getCategory(value.currentETariff),
      cost: null,
    });

  const exportTariffs = [...EETARIFFS];
  if (
    value.currentEETariff &&
    !exportTariffs.some((tariff) => tariff.tariff === value.currentEETariff)
  )
    exportTariffs.push({
      tariff: value.currentEETariff,
      type: "E",
      category: getCategory(value.currentEETariff),
      cost: null,
    });

  /* get data from API */
  const { dataByTime } = useConsumptionPattern({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.MPAN,
    serialNo: value.ESerialNo,
    daysOfWeek,
  });

  const { dataByTime: dataByTimeExport } = useConsumptionPattern({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.EMPAN,
    serialNo: value.EESerialNo,
    daysOfWeek,
  });

  const { dataByTime: dataByTimeImportTariff } = useTariffQueryAverage({
    tariff: importTariff,
    type: "E",
    gsp: value.gsp,
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    category: getCategory(importTariff),
    enabled: importTariff !== "",
    daysOfWeek,
  });

  const { dataByTime: dataByTimeExportTariff } = useTariffQueryAverage({
    tariff: exportTariff,
    type: "E",
    gsp: value.gsp,
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    category: getCategory(exportTariff),
    enabled: exportTariff !== "",
    daysOfWeek,
  });

  const maxConsumption = useMemo(() => {
    if (dataByTime) return max(dataByTime, (d) => d.consumption / d.count);
  }, [dataByTime]);

  const maxExport = useMemo(() => {
    if (dataByTimeExport)
      return max(dataByTimeExport, (d) => d.consumption / d.count);
  }, [dataByTimeExport]);

  const absoluteMax = Math.max(maxConsumption ?? 0, maxExport ?? 0);

  const noOfDays = daysDiff(period.from, period.to);
  const calculationDuration =
    capitalize(period.duration) === "Custom"
      ? `${noOfDays}-Day`
      : `${capitalize(period.duration)}ly`;

  if (dataByTime && dataByTimeImportTariff && cost.current === undefined)
    cost.current = evenRound(
      (dataByTime.reduce(
        (acc, cur, i) =>
          (cur.consumption / cur.count) *
            (dataByTimeImportTariff[i].price /
              dataByTimeImportTariff[i].count) +
          acc,
        0
      ) *
        noOfDays) /
        100,
      0
    );

  if (
    dataByTimeExport &&
    dataByTimeExportTariff &&
    earning.current === undefined
  )
    earning.current = evenRound(
      (dataByTimeExport.reduce(
        (acc, cur, i) =>
          (cur.consumption / cur.count) *
            (dataByTimeExportTariff[i].price /
              dataByTimeExportTariff[i].count) +
          acc,
        0
      ) *
        noOfDays) /
        100,
      0
    );

  /* effect to sync state and context from localstorage */
  useEffect(() => {
    if (value.currentETariff) {
      setImportTariff(value.currentETariff);
    }
  }, [value.currentETariff]);

  useEffect(() => {
    if (value.currentEETariff) {
      setExportTariff(value.currentEETariff);
    }
  }, [value.currentEETariff]);

  useEffect(() => {
    if (dataByTime) {
      setAdjustedConsumption(dataByTime);
    }
  }, [dataByTime]);

  useEffect(() => {
    setHasExport(isExporting);
  }, [isExporting]);

  useEffect(() => {
    if (dataByTimeExport) {
      setAdjustedExport(dataByTimeExport);
    }
  }, [dataByTimeExport]);

  /* handlers */
  const valueCommitHandler = (index: number) => (value: number[]) => {
    setAdjustedConsumption((prevConsumption) => {
      const nextConsumption = [...prevConsumption];
      nextConsumption[index] = {
        ...nextConsumption[index],
        consumption: (value[0] * nextConsumption[index].count) / 1000,
      };
      return nextConsumption;
    });
  };

  const valueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => valueCommitHandler(i)),
    []
  );

  const exportValueCommitHandler = (index: number) => (value: number[]) => {
    setAdjustedExport((prevExport) => {
      const nextExport = [...prevExport];
      nextExport[index] = {
        ...nextExport[index],
        consumption: (value[0] * nextExport[index].count) / 1000,
      };
      return nextExport;
    });
  };

  const exportValueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => exportValueCommitHandler(i)),
    []
  );

  /* loading while waiting */
  if (!dataByTime) return <Loading />;
  if (hasExport && !dataByTimeExport) return <Loading />;
  if (adjustedConsumption.length === 0 || !maxConsumption) return <Loading />;

  /* derived state from loaded data */
  const totalAllocated = evenRound(
    adjustedConsumption.reduce(
      (acc, cur) => acc + cur.consumption / cur.count,
      0
    ) * 1000,
    0
  );

  const totalConsumption = evenRound(
    dataByTime.reduce((acc, cur) => acc + cur.consumption / cur.count, 0) *
      1000,
    0
  );

  const totalAllocatedExport = evenRound(
    adjustedExport.reduce((acc, cur) => acc + cur.consumption / cur.count, 0) *
      1000,
    0
  );

  const totalExport = dataByTimeExport
    ? evenRound(
        dataByTimeExport.reduce(
          (acc, cur) => acc + cur.consumption / cur.count,
          0
        ) * 1000,
        0
      )
    : 0;

  const avgImportPrice =
    getCategory(importTariff) === "Agile"
      ? (dataByTimeImportTariff?.reduce(
          (acc, cur) => acc + cur.price / cur.count,
          0
        ) ?? 0) / 48
      : dataByTimeImportTariff
      ? median(dataByTimeImportTariff?.map((data) => data.price / data.count))
      : 0;

  const avgExportPrice =
    getCategory(exportTariff) === "Agile"
      ? (dataByTimeExportTariff?.reduce(
          (acc, cur) => acc + cur.price / cur.count,
          0
        ) ?? 0) / 48
      : dataByTimeExportTariff
      ? median(dataByTimeExportTariff?.map((data) => data.price / data.count))
      : 0;

  /* cost calculation */
  const adjustedCost =
    adjustedConsumption && dataByTimeImportTariff
      ? evenRound(
          (adjustedConsumption.reduce(
            (acc, cur, i) =>
              (cur.consumption / cur.count) *
                (dataByTimeImportTariff[i].price /
                  dataByTimeImportTariff[i].count) +
              acc,
            0
          ) *
            noOfDays) /
            100,
          0
        )
      : undefined;
  const adjustedEarning =
    adjustedExport && dataByTimeExportTariff
      ? evenRound(
          (adjustedExport.reduce(
            (acc, cur, i) =>
              (cur.consumption / cur.count) *
                (dataByTimeExportTariff[i].price /
                  dataByTimeExportTariff[i].count) +
              acc,
            0
          ) *
            noOfDays) /
            100,
          0
        )
      : undefined;

  const difference =
    cost.current && earning.current && adjustedEarning && adjustedCost ? (
      cost.current - earning.current - adjustedCost + adjustedEarning
    ) : (
      <SimpleLoading />
    );

  return (
    <div className="flex flex-col justify-between gap-4">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3">
        <TbChartInfographic className="w-8 h-8" />
        Your Electricity Profile (Daily Average)
      </h2>
      <div className="flex items-start flex-wrap">
        <PeriodSelector
          period={period}
          setPeriod={setPeriod}
          hasDaysOfWeek={true}
          daysOfWeek={daysOfWeek}
          setDaysOfWeek={setDaysOfWeek}
        />
      </div>
      <h3 className="flex items-center gap-3 text-accentBlue-500">
        <HiMiniAdjustmentsVertical className="w-6 h-6" /> Shift your daily
        energy use to maximize your saving:
      </h3>
      <div className="flex flex-row justify-between items-center gap-5 flex-wrap bg-theme-900 rounded-2xl p-4">
        <EnergyShiftSimEnergyCounter
          use={totalAllocated}
          total={totalConsumption}
          isExport={false}
        />

        {hasExport && (
          <EnergyShiftSimEnergyCounter
            use={totalAllocatedExport}
            total={totalExport}
            isExport={true}
          />
        )}

        {!hasExport && (
          <div className="flex flex-row gap-2 items-center">
            <FormSolar open={solarFormOpen} setOpen={setSolarFormOpen} />
            <FormBattery open={batteryFormOpen} setOpen={setBatteryFormOpen} />
          </div>
        )}
      </div>
      <div className="flex flex-row justify-between items-center gap-5 flex-wrap bg-black/60 rounded-2xl p-4">
        <EnergyShiftSimTariffSelector
          isExport={false}
          tariff={importTariff}
          tariffs={importTariffs}
          changeImportTariff={setImportTariff}
          changeExportTariff={setExportTariff}
        />
        {hasExport && (
          <EnergyShiftSimTariffSelector
            isExport={true}
            tariff={exportTariff}
            tariffs={exportTariffs}
            changeImportTariff={setImportTariff}
            changeExportTariff={setExportTariff}
          />
        )}
        <div className="flex items-center gap-1 text-sm">
          <h3 className="font-bold text-slate-500 mr-2">Price Reference:</h3>
          <span className="w-4 h-2 bg-lime-500 inline-block"></span>Best
          <span className="w-4 h-2 bg-red-500 inline-block ml-3"></span>Worst
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="basis-1 md:basis-3/4 grid grid-cols-[repeat(8,_minmax(0,_1fr))] sm:grid-cols-[repeat(12,_minmax(0,_1fr))] xl:grid-cols-[repeat(16,_minmax(0,_1fr))] 2xl:grid-cols-[repeat(24,_minmax(0,_1fr))] flex-wrap gap-y-10 border border-accentPink-900 rounded-2xl pl-7 pr-5 pt-8 pb-14">
          {adjustedConsumption.map((data, i) => (
            <div
              className="flex flex-col justify-center items-center gap-y-8"
              key={i}
            >
              <SliderVertical
                defaultValue={Math.round(
                  (1000 * data.consumption) / data.count
                )}
                max={Math.round(absoluteMax * 1.5 * 1000)}
                min={0}
                step={1}
                orientation="vertical"
                slot={new Date(
                  new Date().setHours(
                    Math.floor(i / 2),
                    i % 2 === 1 ? 30 : 0,
                    0,
                    0
                  )
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                onValueCommit={valueCommitHandlerArray[i]}
                disabled={false}
                avgPrice={avgImportPrice}
                price={
                  dataByTimeImportTariff
                    ? dataByTimeImportTariff?.[i].price /
                      dataByTimeImportTariff?.[i].count
                    : undefined
                }
                category={getCategory(importTariff)}
              />
              {hasExport && adjustedExport && totalExport && (
                <SliderVertical
                  defaultValue={Math.round(
                    (1000 * adjustedExport[i]?.consumption) /
                      adjustedExport[i]?.count
                  )}
                  max={Math.round(absoluteMax * 1.5 * 1000)}
                  min={0}
                  step={1}
                  orientation="vertical"
                  slot={new Date(
                    new Date().setHours(
                      Math.floor(i / 2),
                      i % 2 === 1 ? 30 : 0,
                      0,
                      0
                    )
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  onValueCommit={exportValueCommitHandlerArray[i]}
                  disabled={false}
                  isExport={true}
                  inverted={true}
                  avgPrice={avgExportPrice}
                  price={
                    dataByTimeExportTariff
                      ? dataByTimeExportTariff?.[i].price /
                        dataByTimeExportTariff?.[i].count
                      : undefined
                  }
                  category={getCategory(exportTariff)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col basis-1 md:basis-1/4 border border-accentPink-900 rounded-2xl items-start justity-between">
          <div className="flex w-full justify-between items-center px-4 py-4 gap-1 border-b-2 border-dotted border-accentPink-800">
            <h3 className="flex w-full items-center gap-1 ">
              <TbZoomMoney className="w-6 h-6 " /> {calculationDuration} Saving
            </h3>
            <div
              className={`flex flex-row items-center min-h-[40px] ${
                typeof difference === "number"
                  ? difference > 0
                    ? "text-[#85f9ad]"
                    : "text-[#f985c5]"
                  : "text-white"
              }`}
            >
              <span className={`text-3xl font-bold`}>
                {typeof difference === "number" && "£"}
                {difference}
              </span>
            </div>
          </div>

          <EnergyShiftSimCostContainer
            label="Current Tariffs"
            importTariff={value.currentETariff}
            importCost={cost.current}
            exportTariff={value.currentEETariff}
            exportEarning={earning.current}
            hasExport={hasExport}
            variant="current"
          />
          <EnergyShiftSimCostContainer
            label="Selected Tariffs"
            importTariff={importTariff}
            importCost={adjustedCost}
            exportTariff={exportTariff}
            exportEarning={adjustedEarning}
            hasExport={hasExport}
          />
        </div>
      </div>
    </div>
  );
};

export default EnergyShiftSimContainer;
