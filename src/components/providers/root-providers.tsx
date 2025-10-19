'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";

type RootProvidersProps = {
  children: ReactNode;
};

export function RootProviders({ children }: RootProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}