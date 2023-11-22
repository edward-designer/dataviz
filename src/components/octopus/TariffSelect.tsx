"use client";
import { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Badge from "@/components/octopus/Badge";
import { ITariffPlan } from "@/data/source";

interface ITariffSelect {
  tariff: string;
  setTariff: (tariff: string) => void;
  type: string;
  source: ITariffPlan[];
  children?: ReactNode;
}

const TariffSelect = ({
  tariff,
  setTariff,
  type,
  source,
  children,
}: ITariffSelect) => {
  return (
    <div className="flex items-center justify-center font-display">
      <Select
        onValueChange={(value: string) => setTariff(value)}
        defaultValue={tariff}
      >
        <SelectTrigger className="w-auto max-w-full text-xl md:text-4xl text-accentBlue-400 flex items-center justify-center">
          <SelectValue placeholder="Select a Tariff" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="text-slate-500">- {type} -</SelectLabel>
            {source.map(({ code, name, currentPlan }) => (
              <SelectItem key={code} value={code}>
                {name}
                {currentPlan && <Badge label="CURRENT" />}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {children}
    </div>
  );
};

export default TariffSelect;
