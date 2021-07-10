import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";

export const HeaderTools = () => {
  const { video, setVideo, audio, setAudio } = React.useContext(MeetingContext);

  return (
    <div style={styles.headerToolContainer}>
      <button style={styles.button} onClick={() => setAudio(!audio)}>
        {audio ? "mute" : "unmute"}
      </button>
      <button style={styles.button} onClick={() => setVideo(!video)}>
        {video ? "stop video" : "start video"}
      </button>
    </div>
  );
};
