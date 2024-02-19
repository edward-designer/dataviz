"use client";

import { PropsWithChildren, createContext, useEffect, useState } from "react";

export const HiVizContext = createContext({
  hiViz: false,
  setHiViz: (value: boolean) => {},
});

export const HiVizContextProvider = ({ children }: PropsWithChildren) => {
  const [hiViz, setHiViz] = useState(false);

  useEffect(() => {
    const hiVizSetting = localStorage.getItem("hiViz");
    if (hiVizSetting) {
      setHiViz(!!JSON.parse(hiVizSetting));
    }
  }, []);

  useEffect(() => {
    if (document) {
      if (hiViz) {
        document.getElementsByTagName("body")[0].classList.add("hiContrast");
      } else {
        document.getElementsByTagName("body")[0].classList.remove("hiContrast");
      }
    }
  }, [hiViz]);

  useEffect(() => {
    localStorage.setItem("hiViz", JSON.stringify(hiViz));
  }, [hiViz]);

  return (
    <HiVizContext.Provider value={{ hiViz, setHiViz }}>
      {children}
    </HiVizContext.Provider>
  );
};
