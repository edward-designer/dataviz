"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserContextProvider } from "@/context/user";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <UserContextProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </UserContextProvider>
  );
}
