import { createContext, PropsWithChildren, useEffect, useState } from "react";

const initialState = { focus: true };

export const WindowVisibilityContext = createContext(initialState);

export const WindowVisibilityProvider = ({ children }: PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(initialState.focus);

  const handleVisibilitychange = (event: Event) => {
    if (document.visibilityState === "visible") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("visibilitychange", handleVisibilitychange, false);
    return () => {
      window.removeEventListener(
        "visibilitychange",
        handleVisibilitychange,
        false
      );
    };
  }, []);

  return (
    <WindowVisibilityContext.Provider value={{ focus: isVisible }}>
      {children}
    </WindowVisibilityContext.Provider>
  );
};
