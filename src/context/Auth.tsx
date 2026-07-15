import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('task_token'));
  const [user, setUser] = useState<any | null>(JSON.parse(localStorage.getItem('task_user') || 'null'));

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('task_token', newToken);
    localStorage.setItem('task_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be wrapped within AuthProvider');
  return context;
};
