import React from "react";
import * as styles from "./App.styles";
import { AuthProvider } from "./contexts/auth-context";
import { Router } from "./router";

export default function App() {
  return (
    <div style={styles.root}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </div>
  );
}
