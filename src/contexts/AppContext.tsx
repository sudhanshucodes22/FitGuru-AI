import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '@/lib/api';

interface UserProfile {
  name: string;
  goal: string;
  weight: number;
  height: number;
  age: number;
  email?: string;
}

interface AppState {
  isOnboarded: boolean;
  setIsOnboarded: (v: boolean) => void;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
}

const defaultUser: UserProfile = {
  name: 'Alex',
  goal: 'Build Muscle',
  weight: 75,
  height: 178,
  age: 28,
};

const AppContext = createContext<AppState>({} as AppState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const token = localStorage.getItem('fitguru_token');
    if (token) {
      api.auth.getProfile()
        .then((profile) => {
          setUser(profile);
          setIsOnboarded(true);
        })
        .catch((err) => {
          console.error("Failed to auto-login:", err);
          localStorage.removeItem('fitguru_token');
          setIsOnboarded(false);
        });
    }
  }, []);

  return (
    <AppContext.Provider value={{ isOnboarded, setIsOnboarded, user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
