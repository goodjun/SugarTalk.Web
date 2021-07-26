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

  const rtcPeerConnection = React.useRef<RTCPeerConnection>();

  const { video, audio, hasVideo, hasAudio } = React.useContext(MeetingContext);

  const recreatePeerConnection = async () => {
    if (videoRef.current?.srcObject) {
      videoRef.current?.srcObject
        .getTracks()
        .forEach((track: MediaStreamTrack) => {
          track.stop();
        });
    }

    const peer = new RTCPeerConnection();

    const baseStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    baseStream.getTracks().forEach((track: MediaStreamTrack) => {
      peer.addTrack(track, baseStream);
    });

    videoRef.current.srcObject = baseStream;

    rtcPeerConnection.current = peer;

    const offer = await rtcPeerConnection?.current?.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    rtcPeerConnection?.current?.setLocalDescription(offer);

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer?.sdp);

    return rtcPeerConnection;
  };

  // 创建发送端
  const createPeerSendonly = async () => {
    console.log("createPeerSendonly", id);

    recreatePeerConnection().then((peer) => {
      peer.current?.addEventListener("icecandidate", (candidate) => {
        serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
      });
    });
  };

  // 创建接受端
  const createPeerRecvonly = async () => {
    console.log("createPeerRecvonly", id);

    const peer = new RTCPeerConnection();

    peer.addEventListener("addstream", (e: any) => {
      videoRef.current.srcObject = e.stream;
      audioRef.current.srcObject = e.stream;
    });

    peer.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const offer = await peer.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });

    peer.setLocalDescription(offer);

    rtcPeerConnection.current = peer;

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
        rtcPeerConnection?.current?.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: answerSDP })
        );
      }
    });

    serverRef?.current?.on("AddCandidate", (connectionId, candidate) => {
      if (id === connectionId) {
        const objCandidate = JSON.parse(candidate);
        rtcPeerConnection?.current?.addIceCandidate(objCandidate);
      }
    });

    serverRef?.current?.on("NewOfferCreated", (connectionId, answerSDP) => {
      if (id === connectionId && !isSelf) {
        createPeerRecvonly();
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
      <div style={styles.userName}>
        {userName} - {id}
      </div>
    </div>
  );
};
