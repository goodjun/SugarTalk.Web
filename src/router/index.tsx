import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Login from "../pages/login";
import GoogleAuthHandle from "../pages/login/google-auth-handle";
import JoinMeeting from "../pages/join-meeting";
import Meeting from "../pages/meeting";
import NotFound from "../pages/not-found";

export const Router = () => {
  return (
    <BrowserRouter forceRefresh={true}>
      <Switch>
        <Route
          key="join-meeting"
          path="/join-meeting"
          component={JoinMeeting}
          exact
        />
        <Route key="login" path="/login" component={Login} exact />
        <Route
          key="google-redirect-uri"
          path="/"
          component={GoogleAuthHandle}
          exact
        />
        <Route key="meeting" path="/meeting" component={Meeting} exact />
        <Route path="/not-found" component={NotFound} exact />
        <Redirect to="/not-found" />
      </Switch>
    </BrowserRouter>
  );
};
