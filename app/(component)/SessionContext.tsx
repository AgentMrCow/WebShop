"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';

type ShopConfig = {
  checkoutMode: 'demo' | 'paypal-sandbox';
  paypalClientId: string | null;
  providers: { credentials: boolean; google: boolean; github: boolean };
};
const ConfigContext = createContext<{
  config: ShopConfig | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}>({ config: null, loading: true, error: false, reload: () => {} });

export function useShopConfig() { return useContext(ConfigContext); }

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/config', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Configuration unavailable');
        setConfig(await response.json());
      }).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);
  useEffect(reload, [reload]);
  return <SessionProvider><ConfigContext.Provider value={{ config, loading, error, reload }}>
    <CartProvider>{children}</CartProvider>
  </ConfigContext.Provider></SessionProvider>;
}
