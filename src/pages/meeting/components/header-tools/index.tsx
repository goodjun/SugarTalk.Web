import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";

interface IHeaderToolsProps {
  onStart: () => void;
  onStop: () => void;
}

export const HeaderTools = (props: IHeaderToolsProps) => {
  const { video, setVideo, audio, setAudio, screen, setScreen } =
    React.useContext(MeetingContext);

  const { onStart, onStop } = props;

  const onNewWindow = () => {
    window.open(window.location.href, "_blank");
  };

  return (
    <div style={styles.headerToolContainer}>
      <button style={styles.button} onClick={() => setAudio(!audio)}>
        {audio ? "mute" : "unmute"}
      </button>
      <button style={styles.button} onClick={() => setVideo(!video)}>
        {video ? "stop video" : "start video"}
      </button>
      <button style={styles.button} onClick={() => setScreen(!screen)}>
        {screen ? "stop share screen" : "share screen"}
      </button>
      <button style={styles.button} onClick={() => onStart()}>
        start
      </button>
      <button style={styles.button} onClick={() => onStop()}>
        close
      </button>
      <button style={styles.button} onClick={() => onNewWindow()}>
        new window
      </button>
    </div>
  );
};
