"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface IUserValue {
  postcode: string;
  gsp: string;
  apiKey: string;
  accountNumber: string;
}

export const initialValue = {
  value: {
    postcode: "",
    gsp: "A",
    apiKey: "",
    accountNumber: "",
  },
  setValue: (value: IUserValue) => {},
};

export const UserContext = createContext(initialValue);

export const UserContextProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState<IUserValue>(initialValue.value);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("octoprice");
    if (storedValue && storedValue !== "undefined")
      setValue(JSON.parse(storedValue));
  }, []);

  const handleSetValue = (value: IUserValue) => {
    window.localStorage.setItem("octoprice", JSON.stringify(value));
    setValue(value);
  };

  return (
    <UserContext.Provider value={{ value, setValue: handleSetValue }}>
      {children}
    </UserContext.Provider>
  );
};
