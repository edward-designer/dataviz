"use client";

import SliderVertical from "@/components/ui/sliderVertical";
import { UserContext } from "@/context/user";
import {
  TDuration,
  calculateSimTotal,
  capitalize,
  daysDiff,
  evenRound,
  formatNumberToDisplay,
  formatPriceChangeWithSign,
  getAllTariffsWithCurrentTariff,
  getCategory,
  getDatePeriod,
} from "@/utils/helpers";
import { useContext, useEffect, useMemo, useState } from "react";

import EnergyShiftSimEnergyCounter from "./EnergyShiftSimEnergyCounter";
import FormBattery from "./FormBattery";
import FormSolar from "./FormSolar";
import PeriodSelector from "./PeriodSelector";

import Loading from "@/app/loading";

import { HiMiniAdjustmentsVertical } from "react-icons/hi2";
import { TbChartInfographic, TbZoomMoney } from "react-icons/tb";

import { EETARIFFS, ETARIFFS } from "@/data/source";
import useCalculateSimPrice from "@/hooks/useCalculateSimPrice";
import useEnergyShiftData from "@/hooks/useEnergyShiftData";
import { SelectItem } from "../ui/select";
import EnergyShiftSimCostContainer from "./EnergyShiftSimCostContainer";
import EnergyShiftSimTariffSelector from "./EnergyShiftSimTariffSelector";
import EnergyShiftSimTariffWithTotal from "./EnergyShiftSimTariffWithTotal";
import SimpleLoading from "./SimpleLoading";

export type ErrorType = Record<string, string>;

const EnergyShiftSimContainer = () => {
  /* states */
  const { value } = useContext(UserContext);

  const [period, setPeriod] = useState<{
    duration: TDuration | "custom";
    from: Date;
    to: Date;
  }>(getDatePeriod);
  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);

  const [adjustedConsumption, setAdjustedConsumption] = useState<number[]>([]);
  const [adjustedExport, setAdjustedExport] = useState<number[]>([]);

  const [importTariff, setImportTariff] = useState<string>("");
  const [exportTariff, setExportTariff] = useState<string>("");

  const [hasExport, setHasExport] = useState(false);

  const [batteryFormOpen, setBatteryFormOpen] = useState(false);
  const [solarFormOpen, setSolarFormOpen] = useState(false);

  /* derived states */
  const isExporting = !!(value.EESerialNo && value.EMPAN);

  const importTariffs = useMemo(
    () => getAllTariffsWithCurrentTariff(ETARIFFS, value.currentETariff),
    [value.currentETariff]
  );
  const exportTariffs = useMemo(
    () => getAllTariffsWithCurrentTariff(EETARIFFS, value.currentEETariff),
    [value.currentEETariff]
  );

  /* get data from API */
  const {
    dataByTime: dataByTimeImport,
    dataByTimeTariff: dataByTimeImportTariff,
    maxValue: maxConsumption,
    totalValue: totalConsumption,
    avgTariffPrice: avgImportPrice,
  } = useEnergyShiftData({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.MPAN,
    serialNo: value.ESerialNo,
    daysOfWeek,
    tariff: importTariff,
    gsp: value.gsp,
  });

  const {
    dataByTime: dataByTimeExport,
    dataByTimeTariff: dataByTimeExportTariff,
    maxValue: maxExport,
    totalValue: totalExport,
    avgTariffPrice: avgExportPrice,
  } = useEnergyShiftData({
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    type: "E",
    deviceNumber: value.EMPAN,
    serialNo: value.EESerialNo,
    daysOfWeek,
    tariff: exportTariff,
    gsp: value.gsp,
  });

  const absoluteMax = Math.max(maxConsumption ?? 0, maxExport ?? 0);

  const numOfDays = daysDiff(period.from, period.to);
  const calculationDuration =
    capitalize(period.duration) === "Custom"
      ? `${numOfDays}-Day`
      : `${capitalize(period.duration)}ly`;

  const cost = useCalculateSimPrice({
    tariff: value.currentETariff,
    gsp: value.gsp,
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    daysOfWeek,
    numOfDays,
    consumption: dataByTimeImport ?? [],
  });
  const earning = useCalculateSimPrice({
    tariff: value.currentEETariff,
    gsp: value.gsp,
    fromDate: period.from.toUTCString(),
    toDate: period.to.toUTCString(),
    daysOfWeek,
    numOfDays,
    consumption: dataByTimeExport ?? [],
  });

  const currentFigures = {
    cost,
    earning,
  };

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
    if (dataByTimeImport) {
      setAdjustedConsumption(dataByTimeImport);
    }
  }, [dataByTimeImport]);

  useEffect(() => {
    if (dataByTimeExport) {
      setAdjustedExport(dataByTimeExport);
    }
  }, [dataByTimeExport]);

  useEffect(() => {
    setHasExport(isExporting);
  }, [isExporting]);

  /* handlers */
  const valueCommitHandler = (index: number) => (value: number[]) => {
    setAdjustedConsumption((prevConsumption) => {
      const nextConsumption = [...prevConsumption];
      nextConsumption[index] = value[0] / 1000;
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
      nextExport[index] = value[0] / 1000;
      return nextExport;
    });
  };
  const exportValueCommitHandlerArray = useMemo(
    () => Array.from({ length: 48 }).map((_, i) => exportValueCommitHandler(i)),
    []
  );

  /* loading while waiting */
  if (!dataByTimeImport) return <Loading />;
  if (hasExport && !dataByTimeExport) return <Loading />;
  if (adjustedConsumption.length === 0 || maxConsumption === undefined)
    return <Loading />;

  /* derived from state */
  const totalAllocated = evenRound(
    adjustedConsumption.reduce((acc, cur) => acc + cur, 0) * 1000,
    0
  );
  const totalAllocatedExport = evenRound(
    adjustedExport.reduce((acc, cur) => acc + cur, 0) * 1000,
    0
  );

  const adjustedCost = calculateSimTotal(
    adjustedConsumption,
    dataByTimeImportTariff,
    numOfDays
  );
  const adjustedEarning = calculateSimTotal(
    adjustedExport,
    dataByTimeExportTariff,
    numOfDays
  );

  const difference = isExporting ? (
    currentFigures.cost !== undefined &&
    currentFigures.earning !== undefined &&
    adjustedEarning !== undefined &&
    adjustedCost !== undefined ? (
      currentFigures.cost -
      currentFigures.earning -
      adjustedCost +
      adjustedEarning
    ) : (
      <SimpleLoading />
    )
  ) : currentFigures.cost !== undefined && adjustedCost !== undefined ? (
    currentFigures.cost - adjustedCost
  ) : (
    <SimpleLoading />
  );

  return (
    <div className="flex flex-col justify-between gap-4">
      <h2 className="text-accentPink-600 font-display text-4xl flex items-center gap-3 mb-3">
        <TbChartInfographic className="w-8 h-8" />
        My Electricity Profile (Daily Average)
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
        <HiMiniAdjustmentsVertical className="w-6 h-6" /> Shift daily energy use
        pattern to maximize saving! VAT inclusive; standing charge excluded.
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
        >
          {importTariffs.map(({ tariff }) => (
            <SelectItem key={tariff} value={tariff}>
              <EnergyShiftSimTariffWithTotal
                tariff={tariff}
                gsp={value.gsp}
                fromDate={period.from.toUTCString()}
                toDate={period.to.toUTCString()}
                daysOfWeek={daysOfWeek}
                numOfDays={numOfDays}
                consumption={adjustedConsumption}
              />
            </SelectItem>
          ))}
        </EnergyShiftSimTariffSelector>
        {hasExport && (
          <EnergyShiftSimTariffSelector
            isExport={true}
            tariff={exportTariff}
            tariffs={exportTariffs}
            changeImportTariff={setImportTariff}
            changeExportTariff={setExportTariff}
          >
            {exportTariffs.flatMap(({ tariff }) => [
              <SelectItem key={tariff} value={tariff}>
                <EnergyShiftSimTariffWithTotal
                  tariff={tariff}
                  gsp={value.gsp}
                  fromDate={period.from.toUTCString()}
                  toDate={period.to.toUTCString()}
                  daysOfWeek={daysOfWeek}
                  numOfDays={numOfDays}
                  consumption={adjustedExport}
                />
              </SelectItem>,
            ])}
          </EnergyShiftSimTariffSelector>
        )}
        <div className="flex items-center gap-1 text-sm">
          <h3 className="font-bold text-slate-500 mr-2">Price Reference:</h3>
          <span className="w-4 h-2 bg-lime-500 inline-block"></span>Best
          <span className="w-4 h-2 bg-red-500 inline-block ml-3"></span>Worst
        </div>
      </div>
      <div className="flex flex-col-reverse md:flex-row gap-3">
        <div className="basis-1 md:basis-3/4 grid grid-cols-[repeat(8,_minmax(0,_1fr))] sm:grid-cols-[repeat(12,_minmax(0,_1fr))] xl:grid-cols-[repeat(16,_minmax(0,_1fr))] 2xl:grid-cols-[repeat(24,_minmax(0,_1fr))] flex-wrap gap-y-10 border border-accentPink-900 rounded-2xl pl-7 pr-5 pt-8 pb-14">
          {adjustedConsumption.map((data, i) => (
            <div
              className="flex flex-col justify-center items-center gap-y-8"
              key={i}
            >
              <SliderVertical
                defaultValue={Math.round(1000 * data)}
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
                price={dataByTimeImportTariff?.[i]}
                category={getCategory(importTariff)}
              />
              {hasExport && (
                <SliderVertical
                  defaultValue={Math.round(adjustedExport[i] * 1000)}
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
                  price={dataByTimeExportTariff?.[i]}
                  category={getCategory(exportTariff)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col flex-grow basis-1 md:basis-1/4 border border-accentPink-900 rounded-2xl items-between justity-between">
          <div>
            <div className="flex w-full flex-col justify-between items-center px-4 py-4 gap-1 border-b-2 border-dotted border-accentPink-800">
              <div className="flex w-full justify-between">
                <h3 className="flex items-center gap-1 ">
                  <TbZoomMoney className="w-6 h-6 " /> {calculationDuration}{" "}
                  Saving
                </h3>
                <div
                  className={`flex flex-1 flex-row items-center text-right min-h-[40px] ${
                    typeof difference === "number"
                      ? formatNumberToDisplay(difference) > 0
                        ? "text-[#85f9ad]"
                        : formatNumberToDisplay(difference) < 0
                        ? "text-[#f985c5]"
                        : "text-white"
                      : "text-white"
                  }`}
                >
                  <span
                    className={`flex-1 text-3xl font-bold flex justify-end`}
                  >
                    {typeof difference === "number"
                      ? formatPriceChangeWithSign(difference)
                      : difference}
                  </span>
                </div>
              </div>
            </div>

            <EnergyShiftSimCostContainer
              label="Current Tariffs"
              importTariff={value.currentETariff}
              importCost={currentFigures.cost}
              exportTariff={value.currentEETariff}
              exportEarning={currentFigures.earning}
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
          <div className="flex-grow flex flex-col justify-end p-4 gap-1 text-slate-400">
            <div className="text-sm text-accentPink-500">Remarks:</div>
            <div className="text-xs">
              <strong>Flux/Intelligent Flux</strong>: a tariff for both import
              and export at the same time, must have a (compatible) solar system
              and home battery
            </div>
            <div className="text-xs">
              <strong>Go</strong>: must have EV and (compatible) home charger,
              can only select Fixed Lite Export
            </div>
            <div className="text-xs">
              <strong>Cosy</strong>: must have a heat pump
            </div>
            <div className="text-xs">
              Figures above are estimations only. Past results do not guarantee
              future performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyShiftSimContainer;
