import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Login from "../pages/login";
import GoogleAuthHandle from "../pages/login/google-auth-handle";
import JoinMeeting from "../pages/join-meeting";
import Meeting from "../pages/meeting";
import NotFound from "../pages/not-found";
import { AuthContext } from "../contexts/auth-context";

const NotAuthRouter = () => {
  return (
    <>
      <Route key="login" path="/login" component={Login} exact />
      <Route
        key="google-redirect-uri"
        path="/"
        component={GoogleAuthHandle}
        exact
      />
    </>
  );
};

const AuthRouter = () => {
  return (
    <>
      <Route
        key="join-meeting"
        path="/join-meeting"
        component={JoinMeeting}
        exact
      />
      <Route key="meeting" path="/meeting" component={Meeting} exact />
    </>
  );
};

export const Router = () => {
  const { isLogin } = React.useContext(AuthContext);

  return (
    <BrowserRouter forceRefresh={true}>
      <Switch>
        {!isLogin ? <NotAuthRouter /> : <AuthRouter />}
        <Route path="/not-found" component={NotFound} />
        <Redirect to="/not-found" />
      </Switch>
    </BrowserRouter>
  );
};
