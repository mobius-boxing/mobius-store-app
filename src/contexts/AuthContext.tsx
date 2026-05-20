import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginCredentials, StoreUser } from '../types';
import { storeAuthApi, STORAGE_KEYS } from '../services/api';

interface StoreAuthContextType {
  storeUser: StoreUser | null;
  companyName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [storeUser, setStoreUser] = useState<StoreUser | null>(() => {
    // Hydrate from cache to avoid a flash before bootstrap resolves.
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.user);
      return cached ? (JSON.parse(cached) as StoreUser) : null;
    } catch {
      return null;
    }
  });
  const [companyName, setCompanyName] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.companyName)
  );
  const [isLoading, setIsLoading] = useState(true);

  // Bootstrap: validate token via /api/store/me on mount.
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.token);
      if (!token) {
        setStoreUser(null);
        setCompanyName(null);
        setIsLoading(false);
        return;
      }
      try {
        const { storeUser: me, companyName: company } = await storeAuthApi.me();
        const merged: StoreUser = { ...me, companyName: company };
        setStoreUser(merged);
        setCompanyName(company);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(merged));
        localStorage.setItem(STORAGE_KEYS.companyName, company);
      } catch {
        // Invalid/expired token: clear and stay unauthenticated.
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        localStorage.removeItem(STORAGE_KEYS.companyName);
        setStoreUser(null);
        setCompanyName(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { token, storeUser: loggedUser } = await storeAuthApi.login(credentials);
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(loggedUser));

    // Fetch /me to get companyName (login response may omit it) and validate token.
    let company = loggedUser.companyName ?? null;
    try {
      const me = await storeAuthApi.me();
      const merged: StoreUser = { ...me.storeUser, companyName: me.companyName };
      company = me.companyName;
      setStoreUser(merged);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(merged));
    } catch {
      // /me failed but login succeeded — fall back to the login payload.
      setStoreUser(loggedUser);
    }

    setCompanyName(company);
    if (company) {
      localStorage.setItem(STORAGE_KEYS.companyName, company);
    }
  };

  const logout = (): void => {
    // No server /logout endpoint in the contract; JWT is stateless.
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.companyName);
    localStorage.removeItem(STORAGE_KEYS.cart);
    setStoreUser(null);
    setCompanyName(null);
    window.location.href = '/login';
  };

  const value: StoreAuthContextType = {
    storeUser,
    companyName,
    isAuthenticated: !!storeUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
