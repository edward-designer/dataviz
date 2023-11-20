"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface IValue {
  postcode: string;
  gsp: string;
  apiKey: string;
  accountNumber: string;
}

const initialValue = {
  value: {
    postcode: "",
    gsp: "A",
    apiKey: "",
    accountNumber: "",
  },
  setValue: (value: IValue) => {},
};

export const UserContext = createContext(initialValue);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState<IValue>(initialValue.value);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("octoprice");
    if (storedValue) setValue(JSON.parse(storedValue));
  }, []);

  const handleSetValue = (value: IValue) => {
    window.localStorage.setItem("octoprice", JSON.stringify(value));
    setValue(value);
  };

  return (
    <UserContext.Provider value={{ value, setValue: handleSetValue }}>
      {children}
    </UserContext.Provider>
  );
};
