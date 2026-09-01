'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  // Load user from storage on initial page render
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('user_data');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to parse stored user data', e);
    }
  }, []);

  const login = (userData: UserData) => {
    sessionStorage.setItem('user_data', JSON.stringify(userData));
    sessionStorage.setItem('lp_userid', userData.memberid);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('lp_userid');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);