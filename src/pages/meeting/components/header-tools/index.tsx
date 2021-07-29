import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";

interface IHeaderToolsProps {
  onClose: () => void;
}

export const HeaderTools = (props: IHeaderToolsProps) => {
  const { video, setVideo, audio, setAudio } = React.useContext(MeetingContext);

  const { onClose } = props;

  return (
    <div style={styles.headerToolContainer}>
      <button style={styles.button} onClick={() => setAudio(!audio)}>
        {audio ? "mute" : "unmute"}
      </button>
      <button style={styles.button} onClick={() => setVideo(!video)}>
        {video ? "stop video" : "start video"}
      </button>
      <button style={styles.button} onClick={() => onClose()}>
        close
      </button>
    </div>
  );
};
