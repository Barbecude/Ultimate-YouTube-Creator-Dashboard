'use client';

import { SessionProvider } from "next-auth/react";
import { ChannelProvider } from "@/app/context/ChannelContext";

export function Providers({ children, initialChannelId }: { children: React.ReactNode; initialChannelId?: string }) {
  return (
    <SessionProvider>
      <ChannelProvider initialChannelId={initialChannelId || ''}>
        {children}
      </ChannelProvider>
    </SessionProvider>
  );
}