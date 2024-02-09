"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { IUserValue, UserContext } from "@/context/user";
import { FormEvent, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GiBatteryPack } from "react-icons/gi";
import Button from "./Button";
import InfoInput from "./InfoInput";

export interface IFormBattery {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const FormBattery = ({ open, setOpen }: IFormBattery) => {
  const { value, setValue } = useContext(UserContext);

  const [error, setError] = useState<Record<string, string>>({});
  const [hasBattery, setHasBattery] = useState(false);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(0);
  const [efficiency, setEfficiency] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);

  useEffect(() => {
    setBatteryCapacity(value.configBattery.capacity);
    setEfficiency(value.configBattery.efficiency);
    setRate(value.configBattery.rate);
    setHasBattery(value.configBattery.hasBattery);
  }, [value.configBattery]);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError({});
    setValue({
      ...value,
      configBattery: {
        ...value.configBattery,
        capacity: batteryCapacity,
        hasBattery,
        efficiency,
        rate,
      },
    });

    toast.success("Changes are saved.");
    setOpen(false);
  };

  const cancelHandler = (value: IUserValue) => {
    setBatteryCapacity(value.configBattery.capacity);
    setEfficiency(value.configBattery.efficiency);
    setRate(value.configBattery.rate);
    setHasBattery(value.configBattery.hasBattery);
    setOpen(false);
    setError({});
  };

  const handleDialogOpenChange = (state: boolean) => {
    if (!state) {
      cancelHandler(value);
    }
    setOpen(state);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger
        className={`${
          value.configBattery.hasBattery
            ? "text-accentBlue-500"
            : "text-slate-600"
        } relative flex group flex-col justify-center items-center p-1`}
      >
        <GiBatteryPack
          aria-hidden={true}
          className="w-9 h-9 mb-1 group-hover:text-white"
        />
        {!value.configBattery.hasBattery && (
          <span className="block absolute h-14 w-1 bg-slate-900/90 rotate-45 -top-1 group-hover:hidden"></span>
        )}
        <span className="group-hover:text-white text-xs">Battery Storage</span>
        {hasBattery && (
          <span className="text-sm font-bold group-hover:text-white">
            {batteryCapacity} kWh
          </span>
        )}
      </DialogTrigger>

      <DialogContent className="text-white max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Home Battery Storage Info
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submitHandler}>
          <div className="flex items-center gap-2 mb-4">
            <Switch
              id="hasBattery"
              checked={hasBattery}
              onCheckedChange={setHasBattery}
            />
            <label htmlFor="hasBattery">Has Home Battery Storage</label>
          </div>
          {hasBattery && (
            <div className="flex flex-col p-4 gap-2  bg-slate-900 rounded-2xl">
              <InfoInput
                label="Capacity (in kWh)"
                type="number"
                placeHolder="Please enter your battery storage capacity"
                error={error}
                value={batteryCapacity}
                setValue={setBatteryCapacity}
                min={0}
              />
              <InfoInput
                label="Rount-trip Efficiency (in %)"
                type="number"
                placeHolder="Please enter your rount-trip efficiency"
                max={100}
                min={0}
                error={error}
                value={efficiency}
                setValue={setEfficiency}
                pattern="^\d+(?:\.\d{1,2})?$"
                step={0.01}
              />
              <InfoInput
                label="Inverter Charge/Discharge Rate (in kW)"
                type="number"
                placeHolder="Please enter your charge/discharge rate"
                error={error}
                value={rate}
                setValue={setRate}
                min={0}
                pattern="^\d+(?:\.\d{1,2})?$"
                step={0.01}
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap justify-between mt-4">
            <div className="flex gap-2">
              <button
                className="border-accentBlue-500 border px-2 rounded-lg"
                type="submit"
              >
                Submit
              </button>
              <Button
                clickHandler={() => cancelHandler(value)}
                className="border-white/50 border"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormBattery;
