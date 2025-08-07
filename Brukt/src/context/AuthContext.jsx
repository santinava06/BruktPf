import React, { createContext, useState, useEffect } from 'react';
import { getToken, getUser, logout as logoutService, register as registerService, saveAuth } from '../services/auth';

const AuthContext = createContext();

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
  }, []);

  const login = (user, token) => {
    saveAuth({ user, token });
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setToken(null);
  };

  const register = async (nombre, apellido, email, password) => {
    const data = await registerService(nombre, apellido, email, password);
    saveAuth(data);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const updateUser = (updatedUser) => {
    const updatedUserData = { ...user, ...updatedUser };
    saveAuth({ user: updatedUserData, token });
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
} 