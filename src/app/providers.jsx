"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContextProvider } from "@/context/user";
import { WindowResizeProvider } from "@/context/windowResize";
import { WindowVisibilityProvider } from "@/context/windowVisibility";

const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WindowVisibilityProvider>
      <WindowResizeProvider>
        <UserContextProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </UserContextProvider>
      </WindowResizeProvider>
    </WindowVisibilityProvider>
  );
};

export default Providers;
