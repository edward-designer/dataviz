"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContextProvider } from "@/context/user";
import { WindowResizeProvider } from "@/context/windowResize";

const Providers = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WindowResizeProvider>
      <UserContextProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </UserContextProvider>
    </WindowResizeProvider>
  );
};

export default Providers;
