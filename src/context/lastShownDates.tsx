import { createContext, PropsWithChildren, useState } from "react";

interface ILastShownValues {
  E: string | null;
  G: string | null;
}

const initialValues: ILastShownValues = {
  E: null,
  G: null,
};

interface ILastShownContext {
  lastShownDate: ILastShownValues;
  setLastShownDate: React.Dispatch<React.SetStateAction<ILastShownValues>>;
}
export const LastShownContext = createContext<ILastShownContext>({
  lastShownDate: initialValues,
  setLastShownDate: () => {},
});

export const LastShownProvider = ({ children }: PropsWithChildren) => {
  const [value, setValue] = useState(initialValues);

  return (
    <LastShownContext.Provider
      value={{ lastShownDate: value, setLastShownDate: setValue }}
    >
      {children}
    </LastShownContext.Provider>
  );
};
