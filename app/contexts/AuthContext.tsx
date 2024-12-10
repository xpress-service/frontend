'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  vendorId: string | null;
  login: (token: string, vendorId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedVendorId = localStorage.getItem('vendorId');
    if (token && storedVendorId) {
      setIsAuthenticated(true);
      setVendorId(storedVendorId);
    }
  }, []);

  const login = (token: string, vendorId: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('vendorId', vendorId);
    setIsAuthenticated(true);
    setVendorId(vendorId);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorId');
    setIsAuthenticated(false);
    setVendorId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, vendorId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
