import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";
import { OAuth2Client } from "google-auth-library";
import Env from "../../config/env";
import { AuthContext } from "../../contexts/auth-context";

const GoogleAuthHandle = () => {
  const location = useLocation();

  const history = useHistory();

  const { setIdToken } = React.useContext(AuthContext);

  React.useEffect(() => {
    const init = async () => {
      const oAuth2Client = new OAuth2Client(
        Env.googleClientId,
        Env.googleClientSecret,
        Env.googleRedirectUri
      );

      const code = queryString.parse(location.search);

      if (!code.code) {
        history.push("/login");
      }

      const tokenResponse = await oAuth2Client.getToken(code.code as string);

      setIdToken(tokenResponse.tokens.id_token as string);

      history.push("/join-meeting");
    };

    init();
  }, []);

  return <div>test</div>;
};

export default GoogleAuthHandle;
