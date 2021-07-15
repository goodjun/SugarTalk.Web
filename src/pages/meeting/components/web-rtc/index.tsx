import { HubConnection } from "@microsoft/signalr";
import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";
import * as sdpTransform from "sdp-transform";

interface IWebRTC {
  id: string;
  userName: string;
  isSelf: boolean;
  serverRef: React.MutableRefObject<HubConnection | undefined>;
}

export const WebRTC = (props: IWebRTC) => {
  const { id, userName = "unknown", isSelf, serverRef } = props;

  const videoRef = React.useRef<any>();

  const audioRef = React.useRef<any>();

  const rtcPeerRef = React.useRef<RTCPeerConnection>(new RTCPeerConnection());

  const { video, audio, hasVideo, hasAudio } = React.useContext(MeetingContext);

  // 创建发送端
  const createPeerSendonly = async () => {
    rtcPeerRef.current.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: hasVideo,
      audio: hasAudio,
    });

    videoRef.current.srcObject = localStream;

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      rtcPeerRef.current.addTrack(track, localStream);
    });

    const offer = await rtcPeerRef.current.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    rtcPeerRef.current.setLocalDescription(offer);

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp);
  };

  // 创建接受端
  const createPeerRecvonly = async () => {
    rtcPeerRef.current.addEventListener("addstream", (e: any) => {
      videoRef.current.srcObject = e.stream;
      audioRef.current.srcObject = e.stream;
    });

    rtcPeerRef.current.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const offer = await rtcPeerRef.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    rtcPeerRef.current.setLocalDescription(offer);

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp);
  };

  React.useEffect(() => {
    if (isSelf) {
      createPeerSendonly();
    } else {
      createPeerRecvonly();
    }

    serverRef?.current?.on("ProcessAnswer", (connectionId, answerSDP) => {
      if (id === connectionId) {
        console.log("ProcessAnswer", id, isSelf);
        console.log(sdpTransform.parse(answerSDP));
        rtcPeerRef.current.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: answerSDP })
        );
      }
    });

    serverRef?.current?.on("AddCandidate", (connectionId, candidate) => {
      if (id === connectionId) {
        const objCandidate = JSON.parse(candidate);
        rtcPeerRef.current.addIceCandidate(objCandidate);
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
      {!isSelf && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={styles.video}
          muted={isSelf}
        />
      )}
      <div style={styles.userName}>{userName}</div>
    </div>
  );
};
