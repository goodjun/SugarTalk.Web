import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { WebRTC } from "./components/web-rtc";
import { HeaderTools } from "./components/header-tools";
import { MeetingProvider } from "./context";
import Env from "../../config/env";

interface IMeetingInfo {
  username: string;
  meetingNumber: string;
  token: string;
}

interface IUserSession {
  id: string;
  userName: string;
  isSelf: boolean;
}

interface IUser {
  id: string;
  userName: string;
}

const MeetingPage = () => {
  const location = useLocation();

  const serverRef = React.useRef<HubConnection>();

  const [userSessions, setUserSessions] = React.useState<IUserSession[]>([]);

  const createUserSession = (user: IUser, isSelf: boolean) => {
    const userSession: IUserSession = {
      id: user.id,
      userName: user.userName,
      isSelf,
    };

    setUserSessions((oldUserSessions: IUserSession[]) => [
      ...oldUserSessions,
      userSession,
    ]);
  };

  const removeUserSession = (id: string) => {
    setUserSessions((oldUserSessions: IUserSession[]) =>
      oldUserSessions.filter(
        (userSession: IUserSession) => userSession.id !== id
      )
    );
  };

  React.useEffect(() => {
    const meetingInfo = queryString.parse(
      location.search
    ) as any as IMeetingInfo;

    const url = `${Env.apiBaseUrl}/meetingHub?username=${meetingInfo.username}&meetingNumber=${meetingInfo.meetingNumber}`;

    serverRef.current = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => meetingInfo.token })
      .build();

    serverRef.current.onclose((error?: Error) => {
      if (error?.message.includes("MeetingNotFoundException")) {
        alert("Meeting not found.");
      }
    });

    serverRef.current.on("SetLocalUser", (localUser: IUser) => {
      createUserSession(localUser, true);
    });

    serverRef.current.on("SetOtherUsers", (otherUsers: IUser[]) => {
      otherUsers.forEach((user: IUser) => {
        createUserSession(user, false);
      });
    });

    serverRef.current.on("OtherJoined", (otherUser: IUser) => {
      createUserSession(otherUser, false);
    });

    serverRef.current.on("OtherLeft", (connectionId: string) => {
      removeUserSession(connectionId);
    });

    serverRef.current.start().catch((error?: any) => {
      if (error?.statusCode === 401) {
        alert("Unauthorized.");
      }
    });

    return () => {
      serverRef.current?.stop();
    };
  }, []);

  return (
    <div>
      <HeaderTools />
      <div>
        {userSessions.map((userSession, key) => {
          return (
            <WebRTC
              key={key.toString()}
              serverRef={serverRef}
              id={userSession.id}
              userName={userSession.userName}
              isSelf={userSession.isSelf}
            />
          );
        })}
      </div>
    </div>
  );
};

const Meeting = () => (
  <MeetingProvider>
    <MeetingPage />
  </MeetingProvider>
);

export default Meeting;
