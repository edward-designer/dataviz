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

export type ErrorType = Record<string, string>;

interface IAddATariff {
  tariffs: ITariffToCompare[];
  addToTariff: (value: (typeof ETARIFFS)[number]["tariff"]) => void;
}

const AddATariff = ({ tariffs, addToTariff }: IAddATariff) => {
  const [open, setOpen] = useState(false);
  const [tariff, setTariff] = useState("");

  const submitHandler = () => {
    addToTariff(tariff);
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
              Add a Tariff for Comparison
            </DialogTitle>
          </DialogHeader>

          <Select
            onValueChange={(value: string) => setTariff(value)}
          >
            <SelectTrigger className="w-full border border-accentBlue-500/50 rounded-lg text-xl ">
              <SelectValue placeholder="Select a Tariff" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tariffs.map((tariff) => (
                  <SelectItem key={tariff.tariff} value={tariff.tariff}>
                    {tariff.category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
