import React, { HTMLAttributes } from "react";

interface IVideoProps extends HTMLAttributes<HTMLMediaElement> {
  stream?: MediaStream;
}

export const Video = (props: IVideoProps) => {
  const { stream } = props;

  const mediaRef = React.useRef<HTMLMediaElement>();

  React.useEffect(() => {
    if (mediaRef.current && stream) {
      mediaRef.current.srcObject = stream;
    }
  }, [stream]);

  return React.createElement("video", {
    ref: mediaRef,
    ...props,
  });
};
