"use client";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [contextPassword, setContextPassword] = useState("");

  return (
    <AuthContext.Provider value={{ contextPassword, setContextPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
