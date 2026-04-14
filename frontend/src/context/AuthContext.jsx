import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken"),
  );

  // Set axios default header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("authToken", token);
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    }
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            withCredentials: true,
          });
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          setToken(null);
          setUser(null);
        }
      }
    };

    verifyToken();
  }, []);

  const register = async (username, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          username,
          email,
          password,
          confirmPassword,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setToken(response.data.data.token);
        setUser(response.data.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setToken(response.data.data.token);
        setUser(response.data.data.user);
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
