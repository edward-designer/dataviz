"use client";

import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
  createContext,
} from "react";

const initialValue = {
  width: 0,
  height: 0,
};

export const WindowResizeContext = createContext(initialValue);

export const WindowResizeProvider = ({ children }: PropsWithChildren) => {
  const [windowSizes, setWindowSizes] = useState(initialValue);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setWindowSizes({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WindowResizeContext.Provider value={windowSizes}>
      {children}
    </WindowResizeContext.Provider>
  );
};
