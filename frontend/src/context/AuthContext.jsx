
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const getResponseData = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check whether a valid session already exists.
  const refreshUser = useCallback(async (signal) => {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    const data = await getResponseData(response);

    if (response.status === 401 || response.status === 403) {
      setUser(null);
      return null;
    }

    if (!response.ok) {
      throw new Error(data.message || "Unable to verify your session.");
    }

    if (!data.user) {
      setUser(null);
      return null;
    }

    setUser(data.user);
    return data.user;
  }, []);

  // Run once when the application starts.
  useEffect(() => {
    const controller = new AbortController();

    const initializeAuth = async () => {
      try {
        await refreshUser(controller.signal);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Authentication check failed:", error);
          setUser(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      controller.abort();
    };
  }, [refreshUser]);

  // Login user.
  const login = useCallback(async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await getResponseData(response);

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    if (!data.user || !["ADMIN", "EMPLOYEE"].includes(data.user.role)) {
      throw new Error("Invalid user information received from the server.");
    }

    setUser(data.user);

    return data.user;
  }, []);

  // Logout user.
  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.message || "Logout failed.");
      }
    } finally {
      // Clear local authentication state even if the request fails.
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
    }),
    [user, authLoading, login, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access authentication anywhere.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
