'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChannelContextType {
  channelId: string;
  setChannelId: (id: string) => void;
  channelName: string;
  setChannelName: (name: string) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

const STORAGE_KEY_CHANNEL_ID = 'youtube_dashboard_channel_id';
const STORAGE_KEY_CHANNEL_NAME = 'youtube_dashboard_channel_name';

export function ChannelProvider({ children, initialChannelId }: { children: ReactNode; initialChannelId: string }) {
  // Initialize state from localStorage or use initialChannelId
  const [channelId, setChannelIdState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_CHANNEL_ID);
      return stored || initialChannelId;
    }
    return initialChannelId;
  });

  const [channelName, setChannelNameState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_CHANNEL_NAME) || '';
    }
    return '';
  });

  // Wrapper functions to sync with localStorage
  const setChannelId = (id: string) => {
    setChannelIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CHANNEL_ID, id);
    }
  };

  const setChannelName = (name: string) => {
    setChannelNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CHANNEL_NAME, name);
    }
  };

  return (
    <ChannelContext.Provider value={{ channelId, setChannelId, channelName, setChannelName }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within ChannelProvider');
  }
  return context;
}
