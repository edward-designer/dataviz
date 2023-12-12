"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContextProvider } from "@/context/user";
import { WindowResizeProvider } from "@/context/windowResize";
import { WindowVisibilityProvider } from "@/context/windowVisibility";
import { LastShownProvider } from "@/context/lastShownDates";

const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WindowVisibilityProvider>
      <WindowResizeProvider>
        <UserContextProvider>
          <LastShownProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </LastShownProvider>
        </UserContextProvider>
      </WindowResizeProvider>
    </WindowVisibilityProvider>
  );
};

export default Providers;
