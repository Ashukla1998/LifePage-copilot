'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

// Exact interface matching your API response
export interface UserData {
  name: string;
  email: string;
  phone: string;
  city: string;
  designation: string;
  organisation: string;
  intro: string;
  profilepic: string;
  balance_net: number;
  memberid: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

const USER_KEY = 'user_data';
const AUTH_CHANGE_EVENT = 'lp-auth-change';

// sessionStorage is the source of truth; components re-read it when login/logout fire the event
const subscribe = (onChange: () => void) => {
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};
const getSnapshot = () => sessionStorage.getItem(USER_KEY);
const getServerSnapshot = () => null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const savedUser = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo<UserData | null>(() => {
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error('Failed to parse stored user data', e);
      return null;
    }
  }, [savedUser]);
  const isLoggedIn = user !== null;

  const login = (userData: UserData) => {
    // lp_userid stays the anonymous visitor id that user_event tracking rows are keyed by;
    // the member id is available from user_data
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const logout = () => {
    sessionStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);