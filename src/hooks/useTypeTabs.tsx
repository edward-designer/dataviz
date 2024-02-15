import { UserContext } from "@/context/user";
import { useContext, useEffect, useState } from "react";
import Button from "@/components/octopus/Button";

interface ITypeTabs {}

const useTypeTabs = () => {
  const { value } = useContext(UserContext);

  const [currentType, setCurrentType] = useState<"E" | "G" | "EE" | null>("E");

  const hasEImport = !!(value.ESerialNo && value.MPAN);
  const hasEExport = !!(value.EESerialNo && value.EMPAN);
  const hasGImport = !!(value.GSerialNo && value.MPAN);

  const defaultType = hasEExport
    ? "E"
    : hasGImport
    ? "G"
    : hasEExport
    ? "EE"
    : null;
  useEffect(() => {
    if (defaultType) setCurrentType(defaultType);
  }, [defaultType]);

  const Tabs = () => (
    <div className="flex pl-6 z-30 sticky top-0 pt-4 bg-theme-950/70 backdrop-blur-md border-b border-accentPink-900">
      {hasEImport && (
        <Button
          className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
            currentType === "E"
              ? " border-accentPink-500 bg-accentPink-600 text-white"
              : "bg-accentPink-950 text-accentPink-400 hover:bg-accentPink-500 hover:text-white border-accentPink-950/50"
          }`}
          clickHandler={() => setCurrentType("E")}
        >
          Electricity
        </Button>
      )}
      {hasEExport && (
        <Button
          className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
            currentType === "EE"
              ? " border-accentPink-500 bg-accentPink-600 text-white"
              : "bg-accentPink-950 text-accentPink-400 hover:bg-accentPink-500 hover:text-white border-accentPink-950/50"
          }`}
          clickHandler={() => setCurrentType("EE")}
        >
          Electricity (Export)
        </Button>
      )}
      {hasGImport && (
        <Button
          className={`border-t border-l border-r rounded-t-xl rounded-b-none ${
            currentType === "G"
              ? " border-accentPink-500 bg-accentPink-600 text-white"
              : "bg-accentPink-950 text-accentPink-400 hover:bg-accentPink-500 hover:text-white border-accentPink-950/50"
          }`}
          clickHandler={() => setCurrentType("G")}
        >
          Gas
        </Button>
      )}
    </div>
  );
  return { currentType, Tabs };
};

export default useTypeTabs;
