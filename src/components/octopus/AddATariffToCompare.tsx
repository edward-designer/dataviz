"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import toast from "react-hot-toast";

import { IUserValue, UserContext } from "@/context/user";
import Button from "./Button";
import InfoInput from "./InfoInput";
import Remark from "./Remark";

import { getGsp } from "@/utils/helpers";

import { IoLocationOutline } from "react-icons/io5";
import { VscAdd } from "react-icons/vsc";
import { ETARIFFS, ITariffToCompare } from "@/data/source";
import TariffDetails from "./TariffDetails";

export type ErrorType = Record<string, string>;

interface IAddATariff {
  tariffs: ITariffToCompare[];
  addToTariff: (value: (typeof ETARIFFS)[number]["tariff"]) => void;
}

const AddATariff = ({ tariffs, addToTariff }: IAddATariff) => {
  const [open, setOpen] = useState(false);
  const [tariff, setTariff] = useState<string[]>([]);

  const submitHandler = () => {
    tariff.forEach((tariffCode) => addToTariff(tariffCode));
    setTariff([]);
    setOpen(false);
  };
  const cancelHandler = () => {
    setOpen(false);
  };

  const handleDialogOpenChange = (state: boolean) => {
    setOpen(state);
  };

  return (
    <div className="flex">
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger className="text-accentPink-600 flex">
          <VscAdd className="w-12 h-12 fill-white/60" />
          <span className="sr-only">Add a Tariff</span>
        </DialogTrigger>
        <DialogContent className="text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Add Tariff(s) for Comparison
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col text-2xl font-thin">
            {tariffs.map((tariff) => (
              <label
                key={tariff.tariff}
                className="flex gap-2 items-center [&:has(:checked)]:text-accentPink-500 [&:has(:checked)]:font-bold"
              >
                <input
                  type="checkbox"
                  name="tariff"
                  value={tariff.tariff}
                  className="w-4 h-4 accent-accentPink-500"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTariff((tariff) =>
                      e.target.checked
                        ? [...tariff, e.target.value]
                        : [...tariff].filter(
                            (tariffCode) => tariffCode !== e.target.value
                          )
                    )
                  }
                />
                Octopus{" "}
                {tariff.category === "IGo"
                  ? "Intelligent Go"
                  : tariff.category === "IFlux"
                  ? "Intelligent Flux"
                  : tariff.category}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              clickHandler={submitHandler}
              className="border-accentBlue-500 border"
            >
              Submit
            </Button>
            <Button
              clickHandler={cancelHandler}
              className="border-white/50 border"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddATariff;
