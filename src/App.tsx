import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./pages/login";
import Meeting from "./pages/meeting";
import * as styles from "./App.styles";

export default function App() {
  return (
    <div style={styles.root}>
      <Router forceRefresh={true}>
        <Switch>
          <Route key="login" path="/" component={Login} exact />
          <Route key="meeting" path="/meeting" component={Meeting} exact />
        </Switch>
      </Router>
    </div>
  );
}
