// contexts/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize with value from sessionStorage if available
  const [contextPassword, setContextPassword] = useState("");

  // Load from sessionStorage on first render
  useEffect(() => {
    const storedPassword = sessionStorage.getItem("tempSignupPassword");
    if (storedPassword) {
      setContextPassword(storedPassword);
    }
  }, []);

  // Create a wrapper function that also saves to sessionStorage
  const setPasswordWithStorage = (password) => {
    setContextPassword(password);
    sessionStorage.setItem("tempSignupPassword", password);
  };

  return (
    <AuthContext.Provider
      value={{
        contextPassword,
        setContextPassword: setPasswordWithStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
