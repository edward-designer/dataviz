import {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  useId,
  KeyboardEvent,
} from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Button from "./Button";
import { MdOutlineClear } from "react-icons/md";
import { ErrorType } from "./UserInfo";
import { capitalize } from "@/utils/helpers";

type IInfoInput =
  | {
      label: string;
      type: "text";
      placeHolder: string;
      error: ErrorType;
      value: string;
      setValue: ((value: string) => void) | null;
      clearHandler: (() => void) | null;
      remark?: ReactNode;
      notice?: string;
      enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
    }
  | {
      label: string;
      type: "number";
      placeHolder: string;
      error: ErrorType;
      value: number;
      setValue: ((value: number) => void) | null;
      clearHandler: (() => void) | null;
      remark?: ReactNode;
      notice?: string;
      enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
    };

const InfoInput = ({
  label,
  type,
  placeHolder = "",
  error,
  value,
  setValue,
  clearHandler,
  remark,
  notice,
  enterKeyHint = "next",
}: IInfoInput) => {
  const id = useId();

  let changeHandler = null;

  if (type === "text" && setValue !== null) {
    changeHandler = (e: ChangeEvent<HTMLInputElement>) =>
      setValue(e.target.value);
  }
  if (type === "number" && setValue !== null) {
    changeHandler = (e: ChangeEvent<HTMLInputElement>) =>
      setValue(Number(e.target.value));
  }

  const onChangeProps =
    changeHandler === null ? {} : { onChange: changeHandler };

  return (
    <div className="grid w-full items-center gap-1 mb-1">
      <div className="flex flex-row">
        <Label htmlFor={id}>{capitalize(label)}</Label>
        {!!remark && remark}
      </div>
      <div className="flex w-full">
        <Input
          type={type}
          id={id}
          name={label}
          placeholder={placeHolder}
          value={value}
          className="flex-1"
          disabled={!setValue}
          enterKeyHint={enterKeyHint}
          {...onChangeProps}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== "Enter") return;
            const inputs = document.querySelectorAll("input");
            if (inputs.length === 1) {
              inputs[0].blur();
              return;
            }
            if (inputs.length > 1) {
              const currentInd = [...inputs].indexOf(e.currentTarget);
              if (currentInd === inputs.length - 1) {
                inputs[0].blur();
                return;
              }
              inputs[currentInd + 1].focus();
            }
          }}
        />
        {value && clearHandler && (
          <Button clickHandler={clearHandler}>
            <MdOutlineClear className="w-6 h-6 text-accentPink-800 hover:text-accentPink-600" />
          </Button>
        )}
      </div>
      {notice && <div className="text-accentBlue-500 text-sm">{notice}</div>}
      {error?.[label] && (
        <div className="text-red-800 text-sm">{error[label]}</div>
      )}
    </div>
  );
};

export default InfoInput;
