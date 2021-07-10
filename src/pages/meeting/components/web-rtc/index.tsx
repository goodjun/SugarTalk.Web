import { HubConnection } from "@microsoft/signalr";
import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";

interface IWebRTC {
  id: string;
  userName: string;
  isSelf: boolean;
  serverRef: React.MutableRefObject<HubConnection | undefined>;
}

export const WebRTC = (props: IWebRTC) => {
  const { id, userName = "unknown", isSelf, serverRef } = props;

  const videoRef = React.useRef<any>();

  const rtcPeerRef = React.useRef<RTCPeerConnection | null>(null);

  const { video, audio, hasVideo, hasAudio } = React.useContext(MeetingContext);

  const createPeerSendonly = async () => {
    const rtcPeer = new RTCPeerConnection();

    rtcPeer.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true && hasVideo,
      audio: true && hasAudio,
    });

    videoRef.current.srcObject = localStream;

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      rtcPeer.addTrack(track, localStream);
      if (track.kind === "audio") {
        track.enabled = audio;
      } else if (track.kind === "video") {
        track.enabled = video;
      }
    });

    const offer = await rtcPeer.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    rtcPeer.setLocalDescription(offer);
    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp);

    rtcPeerRef.current = rtcPeer;
  };

  const createPeerRecvonly = async () => {
    const rtcPeer = new RTCPeerConnection();

    rtcPeer.addEventListener("addstream", (e: any) => {
      videoRef.current.srcObject = e.stream;
    });

    rtcPeer.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const offer = await rtcPeer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp);

    rtcPeer.setLocalDescription(offer);

    rtcPeerRef.current = rtcPeer;
  };

  React.useEffect(() => {
    if (isSelf) {
      createPeerSendonly();
    } else {
      createPeerRecvonly();
    }

    serverRef?.current?.on("ProcessAnswer", (connectionId, answerSDP) => {
      if (id === connectionId) {
        rtcPeerRef?.current?.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: answerSDP })
        );
      }
    });

    serverRef?.current?.on("AddCandidate", (connectionId, candidate) => {
      if (id === connectionId) {
        const objCandidate = JSON.parse(candidate);
        rtcPeerRef?.current?.addIceCandidate(objCandidate);
      }
    });
  }, []);

  React.useEffect(() => {
    if (isSelf && videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getAudioTracks()
        .forEach((track: MediaStreamTrack) => {
          track.enabled = audio;
        });
    }
  }, [audio]);

  React.useEffect(() => {
    if (isSelf && videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getVideoTracks()
        .forEach((track: MediaStreamTrack) => {
          track.enabled = video;
        });
    }
  }, [video]);

  return (
    <div style={styles.videoContainer}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="250"
        height="250"
        style={styles.video}
        muted={isSelf}
      />
      <div style={styles.userName}>{userName}</div>
    </div>
  );
};
