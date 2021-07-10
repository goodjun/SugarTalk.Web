import React from "react";
import { useMemo } from "react";

interface IAuthContextValue {
  idToken: string;
  setIdToken: React.Dispatch<React.SetStateAction<string>>;
  isLogin: boolean;
}

export const AuthContext = React.createContext<IAuthContextValue>({
  idToken: "",
  setIdToken: () => {},
  isLogin: false,
});

export const AuthProvider: React.FC = ({ children }) => {
  const [idToken, setIdToken] = React.useState<string>("");

  const isLogin = useMemo(() => !!idToken, [idToken]);

  React.useEffect(() => {
    const value = localStorage.getItem("idToken");
    if (value) {
      setIdToken(value as string);
    }
  }, []);

  React.useEffect(() => {
    if (idToken) {
      localStorage.setItem("idToken", idToken);
    }
  }, [idToken]);

  return (
    <AuthContext.Provider
      value={{
        idToken,
        setIdToken,
        isLogin,
      }}
    >
      {children && children}
    </AuthContext.Provider>
  );
};
