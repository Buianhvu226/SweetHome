import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export default function AppProvider({
  children,
  initialSessionToken,
  initialRefreshToken,
  initialRole,
  initialId,
  initialName,
}) {
  const [id, setId] = useState(() => {
    return initialId || localStorage.getItem("id");
  });
  const [role, setRole] = useState(() => {
    return initialRole || localStorage.getItem("role");
  });

  const [name, setName] = useState(() => {
    return initialName || localStorage.getItem("name");
  });

  const [sessionToken, setSessionToken] = useState(() => {
    return initialSessionToken || localStorage.getItem("accessToken") || "";
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return initialRefreshToken || localStorage.getItem("refreshToken") || "";
  });

  useEffect(() => {
    if (sessionToken && role) {
      localStorage.setItem("role", role);
      localStorage.setItem("accessToken", sessionToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("id", id);
      localStorage.setItem("name", name);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("id");
      localStorage.removeItem("name");
    }
  }, [sessionToken, refreshToken, role, id, name]);

  return (
    <AppContext.Provider
      value={{
        sessionToken,
        setSessionToken,
        refreshToken,
        setRefreshToken,
        role,
        setRole,
        id,
        setId,
        name,
        setName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

AppProvider.propTypes = {
  children: PropTypes.node,
  initialSessionToken: PropTypes.string,
  initialRefreshToken: PropTypes.string,
  initialRole: PropTypes.string,
  initialId: PropTypes.string,
  initialName: PropTypes.string,
};
