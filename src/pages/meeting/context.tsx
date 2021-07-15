import React from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

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
  hasVideo: boolean;
  hasAudio: boolean;
}

export const MeetingContext = React.createContext<IMeetingContextValue>({
  video: true,
  setVideo: () => {},
  audio: true,
  setAudio: () => {},
  hasVideo: true,
  hasAudio: true,
});

export const MeetingProvider: React.FC = ({ children }) => {
  const [video, setVideo] = React.useState<boolean>(true);
  const [audio, setAudio] = React.useState<boolean>(true);
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
        hasVideo,
        hasAudio,
      }}
    >
      {children && children}
    </MeetingContext.Provider>
  );
};
