import React from "react";
import { OAuth2Client } from "google-auth-library";
import Env from "../../config/env";

const Login = () => {
  const loginByGoogle = () => {
    const oAuth2Client = new OAuth2Client(
      Env.googleClientId,
      Env.googleClientSecret,
      Env.googleRedirectUri
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/userinfo.profile",
    });

    window.location.href = authorizeUrl;
  };

  return (
    <div>
      <button onClick={() => loginByGoogle()}>login by google</button>
    </div>
  );
};

export default Login;
