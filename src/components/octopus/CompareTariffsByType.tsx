"use client";

import { UserContext } from "@/context/user";
import { IPeriod, ITariffToCompare, TariffCategory } from "@/data/source";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import NotCurrentlySupported from "./NotCurrentlySupported";
import TariffComparisionCard from "./TariffComparisionCard";

import { AnimatePresence } from "framer-motion";
import { AiFillFire } from "react-icons/ai";
import { BsLightningChargeFill } from "react-icons/bs";
import { PiSunDimFill } from "react-icons/pi";
import AddATariff from "./AddATariffToCompare";
import TariffDetails from "./TariffDetails";
import { getCategory } from "@/utils/helpers";

const CompareTariffsByType = ({
  selectedTariffs,
  allTariffs,
  type,
  period,
  isExport = false,
}: {
  selectedTariffs: ITariffToCompare[];
  allTariffs: ITariffToCompare[];
  type: "E" | "G";
  period: IPeriod;
  isExport?: boolean;
}) => {
  const { value } = useContext(UserContext);
  const [tariffsToCompare, setTariffsToCompare] = useState(selectedTariffs);

  const typePlusExport = isExport ? "EE" : type;

  const addToTariff = (tariffToAdd: (typeof allTariffs)[number]["tariff"]) => {
    setTariffsToCompare((tariffsToCompare) => {
      const newTariff = allTariffs.find(
        (tariff) => tariff.tariff === tariffToAdd
      );
      if (newTariff) return [...tariffsToCompare, newTariff];
      return tariffsToCompare;
    });
  };

  const setCost = useCallback(
    (tariff: string, cost: number) =>
      setTariffsToCompare((value) =>
        [...value].map((tariffSet) => {
          if (tariffSet.tariff === tariff) {
            return { ...tariffSet, cost };
          }
          return tariffSet;
        })
      ),
    []
  );

  const SVTCost = (tariffsToCompare: ITariffToCompare[]) => {
    const SVTTariff = tariffsToCompare.find(
      (tariffSet) => tariffSet.category === "SVT"
    );
    return SVTTariff === undefined ? null : SVTTariff.cost;
  };

  const LowestCost = (tariffsToCompare: ITariffToCompare[]) => {
    const cost = tariffsToCompare.at(-1)?.cost;
    return cost === undefined ? null : cost;
  };

  const reOrderedTariffsEToCompare = [...tariffsToCompare].sort((a, b) =>
    isExport
      ? (b.cost ?? Infinity) - (a.cost ?? Infinity)
      : (a.cost ?? Infinity) - (b.cost ?? Infinity)
  );

  const remainingTariffs = [...allTariffs].filter(
    (tariff) =>
      !tariffsToCompare.map((tariff) => tariff.tariff).includes(tariff.tariff)
  );

  const currentMeterType = useMemo(
    () => ({
      E: {
        accessPoint: value.MPAN,
        serialNo: value.ESerialNo,
        currentContract: value.currentEContract,
        currentTariff: value.currentETariff,
        heading: (
          <>
            <BsLightningChargeFill className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
            Electricity
          </>
        ),
      },
      G: {
        accessPoint: value.MPRN,
        serialNo: value.GSerialNo,
        currentContract: value.currentGContract,
        currentTariff: value.currentGTariff,
        heading: (
          <>
            <AiFillFire className="w-8 h-8 fill-accentPink-900 inline-block mr-2" />
            Gas
          </>
        ),
      },
      EE: {
        accessPoint: value.EMPAN,
        serialNo: value.EESerialNo,
        currentContract: value.currentEEContract,
        currentTariff: value.currentEETariff,
        heading: (
          <>
            <PiSunDimFill className="w-8 h-8 fill-accentPink-700 inline-block mr-2" />
            Electricity (export)
          </>
        ),
      },
    }),
    [value]
  );

  useEffect(() => {
    if (!currentMeterType[typePlusExport].currentTariff) return;
    if (
      tariffsToCompare.some(
        (tariff) =>
          tariff.tariff === currentMeterType[typePlusExport].currentTariff
      )
    )
      return;
    const currentTariff = currentMeterType[typePlusExport].currentTariff;
    const currentTariffCategory = getCategory(
      currentMeterType[typePlusExport].currentTariff
    );
    if (["Agile", "Tracker"].includes(currentTariffCategory)) return;
    setTariffsToCompare((tariffs) => [
      ...tariffs.filter((tariff) => tariff.category !== currentTariffCategory),
      {
        tariff: currentTariff,
        type,
        category: currentTariffCategory,
        cost: null,
      } as ITariffToCompare,
    ]);
  }, [currentMeterType, tariffsToCompare, type, typePlusExport]);

  if (
    typePlusExport === "E" &&
    !isExport &&
    !(value.MPAN && value.ESerialNo && value.currentEContract)
  )
    return;

  if (
    typePlusExport === "G" &&
    !(value.MPRN && value.GSerialNo && value.currentGContract)
  )
    return;

  if (
    typePlusExport === "EE" &&
    isExport &&
    !(value.EMPAN && value.EESerialNo && value.currentEEContract)
  )
    return;

  return (
    <div className="flex flex-col pt-6 gap-4">
      {value.error ? (
        <NotCurrentlySupported>{value.error}</NotCurrentlySupported>
      ) : (
        <>
          <h2 className="font-display text-accentPink-500 text-4xl flex items-center">
            {currentMeterType[typePlusExport].heading}
          </h2>
          <TariffDetails
            valid_from={
              currentMeterType[typePlusExport].currentContract!.valid_from
            }
            valid_to={
              currentMeterType[typePlusExport].currentContract!.valid_to
            }
            tariff_code={
              currentMeterType[typePlusExport].currentContract?.tariff_code ??
              ""
            }
            type={type}
          />
          <div className="flex gap-4 flex-col lg:grid lg:grid-cols-3">
            <AnimatePresence>
              {reOrderedTariffsEToCompare.map(({ tariff, category }, ind) => {
                return (
                  <TariffComparisionCard
                    key={tariff}
                    type={type}
                    deviceNumber={currentMeterType[typePlusExport].accessPoint}
                    serialNo={currentMeterType[typePlusExport].serialNo}
                    tariff={tariff}
                    category={category}
                    fromDate={period.from.toISOString()}
                    toDate={period.to.toISOString()}
                    compareTo={
                      isExport
                        ? LowestCost(reOrderedTariffsEToCompare)
                        : SVTCost(tariffsToCompare)
                    }
                    setCost={setCost}
                    rank={ind + 1}
                    isExport={isExport}
                  />
                );
              })}
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
      <i className="text-xs">
        Remember: Past results do not guarantee future performance.
      </i>
    </div>
  );
};

export default memo(CompareTariffsByType);
