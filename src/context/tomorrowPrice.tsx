import { createContext, PropsWithChildren, useState } from "react";

interface ITomorrowPriceValues {
  E: string | null;
  G: string | null;
}

const initialValues: ITomorrowPriceValues = {
  E: null,
  G: null,
};

interface ITomorrowPriceContext {
  tomorrowRates: ITomorrowPriceValues;
  setTomorrowRates: React.Dispatch<React.SetStateAction<ITomorrowPriceValues>>;
}
export const TomorrowPriceContext = createContext<ITomorrowPriceContext>({
  tomorrowRates: initialValues,
  setTomorrowRates: () => {},
});

export const TomorrowPriceProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState(initialValues);

  return (
    <TomorrowPriceContext.Provider
      value={{ tomorrowRates: value, setTomorrowRates: setValue }}
    >
      {children}
    </TomorrowPriceContext.Provider>
  );
};
