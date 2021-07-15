import React, { HTMLAttributes } from "react";

interface IAudioProps extends HTMLAttributes<HTMLMediaElement> {
  stream?: MediaStream;
}

export const Audio = (props: IAudioProps) => {
  const { stream } = props;

  const mediaRef = React.useRef<HTMLMediaElement>();

  React.useEffect(() => {
    if (mediaRef.current && stream) {
      mediaRef.current.srcObject = stream;
    }
  }, [stream]);

  return React.createElement("audio", {
    ref: mediaRef,
    ...props,
  });
};
