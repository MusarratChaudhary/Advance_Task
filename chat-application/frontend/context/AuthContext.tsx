"use client";

import { createContext, useContext, useEffect, useState } from "react";

import api from "@/lib/axios";

interface User {
  _id: string;

  name: string;

  email: string;

  avatar?: string;

  bio?: string;

  isOnline: boolean;

  createdAt?: string;
}

interface AuthContextType {
  user: User | null;

  loading: boolean;

  setUser: (user: User | null) => void;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,

  loading: true,

  setUser: () => {},

  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const getCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");

      setUser(response.data.user);
    } catch (error) {
      console.log("Auth error:", error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,

        loading,

        setUser,

        refreshUser: getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
