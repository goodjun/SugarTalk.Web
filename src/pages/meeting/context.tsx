import React from "react";
import { checkMediaAccess } from "../../utils/media";

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

  React.useEffect(() => {
    const initMediaAccess = async () => {
      const mediaAccessResult = await checkMediaAccess();
      setHasVideo(mediaAccessResult.video);
      setHasAudio(mediaAccessResult.audio);
    };

    initMediaAccess();
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
