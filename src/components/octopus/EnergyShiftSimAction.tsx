import React, { Dispatch } from "react";
import ActionButton from "./ActionButton";
import { TEnergyShiftReducerAction } from "@/reducers/energyShift";
import { GrRevert } from "react-icons/gr";
import { LiaRandomSolid } from "react-icons/lia";
import { checkGoodBadTime, getCategory } from "@/utils/helpers";
import { RiCornerUpRightDoubleLine } from "react-icons/ri";
import { TbArrowBarBoth } from "react-icons/tb";
import { LuArrowDownToLine } from "react-icons/lu";

interface IEnergyShiftSimAction {
  hasExport: boolean;
  importTariff: string;
  avgImportPrice: number | undefined;
  dataByTimeImportTariff: number[] | undefined;
  dataByTimeImport: number[];
  dataByTimeExport?: number[];
  adjustedImport: number[];
  adjustedExport?: number[];
  adjustedImportDispatch: Dispatch<TEnergyShiftReducerAction>;
  adjustedExportDispatch?: Dispatch<TEnergyShiftReducerAction>;
}

const EnergyShiftSimAction = ({
  hasExport,
  importTariff,
  avgImportPrice,
  dataByTimeImportTariff,
  dataByTimeImport,
  dataByTimeExport,
  adjustedImport,
  adjustedExport,
  adjustedImportDispatch,
  adjustedExportDispatch,
}: IEnergyShiftSimAction) => {
  return (
    <div className="flex col-span-full items-center gap-3 flex-wrap">
      {hasExport && adjustedExportDispatch && adjustedExportDispatch && (
        <ActionButton
          clickHandler={() => {
            if (dataByTimeImport)
              adjustedImportDispatch({
                type: "Reset",
                payload: dataByTimeImport,
              });
            if (dataByTimeExport)
              adjustedExportDispatch({
                type: "Reset",
                payload: dataByTimeExport,
              });
          }}
        >
          <GrRevert />
          Reset All
        </ActionButton>
      )}
      <ActionButton
        clickHandler={() => {
          if (dataByTimeImport)
            adjustedImportDispatch({
              type: "Reset",
              payload: dataByTimeImport,
            });
        }}
      >
        <GrRevert />
        Reset Import
      </ActionButton>
      {hasExport && adjustedExportDispatch && (
        <ActionButton
          clickHandler={() => {
              adjustedExportDispatch({
                type: "Reset",
                payload: dataByTimeExport,
              });
          }}
        >
          <GrRevert />
          Reset Export
        </ActionButton>
      )}
      {hasExport && adjustedExportDispatch && (
        <ActionButton
          clickHandler={() => {
            if (adjustedImport && adjustedExport) {
              adjustedImportDispatch({
                type: "Offset Import with Export",
                payload: {
                  from: adjustedImport,
                  to: adjustedExport,
                },
              });
              adjustedExportDispatch({
                type: "Offset Import with Export",
                payload: {
                  from: adjustedExport,
                  to: adjustedImport,
                },
              });
            }
          }}
        >
          <LiaRandomSolid />
          Offset Import with Export
        </ActionButton>
      )}
      {["Agile", "Flux", "IFlux", "Cosy"].includes(
        getCategory(importTariff)
      ) && (
        <ActionButton
          clickHandler={() => {
            if (dataByTimeExport)
              adjustedImportDispatch({
                type: "Remove All Peak Use",
                payload: dataByTimeImportTariff?.map((data) =>
                  Boolean(
                    checkGoodBadTime(
                      false,
                      getCategory(importTariff),
                      data,
                      avgImportPrice
                    ) === "bad"
                  )
                ),
              });
          }}
        >
          <LuArrowDownToLine />
          Remove All Peak Use
        </ActionButton>
      )}
      {["Agile", "Flux", "IFlux", "Cosy", "IGo", "Go"].includes(
        getCategory(importTariff)
      ) && (
        <ActionButton
          clickHandler={() => {
            if (dataByTimeExport)
              adjustedImportDispatch({
                type: "Shift Import to Only Cheap Periods",
                payload: dataByTimeImportTariff?.map((data) =>
                  Boolean(
                    checkGoodBadTime(
                      false,
                      getCategory(importTariff),
                      data,
                      avgImportPrice
                    ) === "good"
                  )
                ),
              });
          }}
        >
          <TbArrowBarBoth />
          Shift Import to Only Cheap Periods
        </ActionButton>
      )}
      {hasExport && adjustedExportDispatch && (
        <ActionButton
          clickHandler={() => {
            adjustedExportDispatch({
              type: "Double Export",
              payload: "",
            });
          }}
        >
          <RiCornerUpRightDoubleLine />
          Double Export
        </ActionButton>
      )}
    </div>
  );
};

export default EnergyShiftSimAction;
