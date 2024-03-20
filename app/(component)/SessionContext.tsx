// @/app/(component)/SessionContext.tsx
"use client"
import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from 'next-auth';

interface SessionProviderProps {
    children: ReactNode;
    session: Session | null;
}

const SessionContext = createContext<Session | null>(null);

export const SessionProvider = ({ children, session }: SessionProviderProps) => {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
