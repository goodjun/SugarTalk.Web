import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import { useUpdateEffect } from "ahooks";

interface IMeetingInfo {
  username: string;
  meetingNumber: string;
  token: string;
  video: boolean;
  audio: boolean;
}

interface IMeetingContextValue {
  video: boolean;
  setVideo: React.Dispatch<React.SetStateAction<boolean>>;
  audio: boolean;
  setAudio: React.Dispatch<React.SetStateAction<boolean>>;
  screen: boolean;
  setScreen: React.Dispatch<React.SetStateAction<boolean>>;
  hasVideo: boolean;
  hasAudio: boolean;
}

export const MeetingContext = React.createContext<IMeetingContextValue>({
  video: false,
  setVideo: () => {},
  audio: true,
  setAudio: () => {},
  screen: false,
  setScreen: () => {},
  hasVideo: true,
  hasAudio: true,
});

export const MeetingProvider: React.FC = ({ children }) => {
  const [video, setVideo] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<boolean>(true);
  const [screen, setScreen] = React.useState<boolean>(false);
  const [hasVideo, setHasVideo] = React.useState<boolean>(true);
  const [hasAudio, setHasAudio] = React.useState<boolean>(true);
  const location = useLocation();

  React.useEffect(() => {
    const meetingInfo = queryString.parse(location.search, {
      parseBooleans: true,
      parseNumbers: true,
    }) as any as IMeetingInfo;

    setHasVideo(meetingInfo.video);
    setHasAudio(meetingInfo.audio);
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        video,
        setVideo,
        audio,
        setAudio,
        screen,
        setScreen,
        hasVideo,
        hasAudio,
      }}
    >
      {children && children}
    </MeetingContext.Provider>
  );
};
