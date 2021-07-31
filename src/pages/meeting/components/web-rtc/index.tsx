import { HubConnection } from "@microsoft/signalr";
import React from "react";
import { MeetingContext } from "../../context";
import * as styles from "./index.styles";
import * as sdpTransform from "sdp-transform";
import { dd } from "../../../../utils/debug";
import { useLockFn, useUpdateEffect } from "ahooks";

interface IWebRTC {
  id: string;
  userName: string;
  isSelf: boolean;
  serverRef: React.MutableRefObject<HubConnection | undefined>;
}

export interface IWebRTCRef {
  onProcessAnswer: (connectionId: string, answerSDP: string) => void;
  onAddCandidate: (connectionId: string, candidate: string) => void;
  onNewOfferCreated: (connectionId: string, answerSDP: string) => void;
  tiggerVideo: () => void;
  tiggerScreen: () => void;
}

export const WebRTC = React.forwardRef<IWebRTCRef, IWebRTC>((props, ref) => {
  const { id, userName = "unknown", isSelf, serverRef } = props;

  const videoRef = React.useRef<any>();

  const audioRef = React.useRef<any>();

  const rtcPeerConnection = React.useRef<RTCPeerConnection>();

  const { audio, video, setVideo, screen, setScreen } =
    React.useContext(MeetingContext);

  // 重新创建发送端
  const recreatePeerSendonly = async (stream: MediaStream) => {
    if (videoRef.current?.srcObject) {
      videoRef.current?.srcObject
        .getTracks()
        .forEach((track: MediaStreamTrack) => {
          track.stop();
        });
    }

    const peer = new RTCPeerConnection();

    stream.getTracks().forEach((track: MediaStreamTrack) => {
      peer.addTrack(track, stream);
    });

    videoRef.current.srcObject = stream;

    rtcPeerConnection.current = peer;

    const offer = await rtcPeerConnection?.current?.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    await rtcPeerConnection?.current?.setLocalDescription(offer);

    await serverRef?.current?.invoke("ProcessOfferAsync", id, offer?.sdp, true);
  };

  // 恢复发送端
  const resumePeerSendonly = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    await recreatePeerSendonly(stream);
  };

  // 摄像头开关
  const tiggerVideo = useLockFn(async () => {
    if (video) {
      await resumePeerSendonly();
      setVideo(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (stream) {
        await recreatePeerSendonly(stream);
        setVideo(true);
        setScreen(false);
      }
    }
  });

  // 共享屏幕开关
  const tiggerScreen = useLockFn(async () => {
    if (screen) {
      await resumePeerSendonly();
      setScreen(false);
    } else {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      if (stream) {
        await recreatePeerSendonly(stream);
        setScreen(true);
        setVideo(false);
      }
    }
  });

  const onProcessAnswer = (connectionId: string, answerSDP: string) => {
    dd("onProcessAnswer", connectionId, isSelf);
    rtcPeerConnection?.current?.setRemoteDescription(
      new RTCSessionDescription({ type: "answer", sdp: answerSDP })
    );
  };

  const onAddCandidate = (connectionId: string, candidate: string) => {
    const objCandidate = JSON.parse(candidate);
    rtcPeerConnection?.current?.addIceCandidate(objCandidate);
  };

  const onNewOfferCreated = (connectionId: string, answerSDP: string) => {
    if (!isSelf) {
      dd("onNewOfferCreated", connectionId, isSelf);
      createPeerRecvonly();
    }
  };

  React.useImperativeHandle(ref, () => ({
    onProcessAnswer,
    onAddCandidate,
    onNewOfferCreated,
    tiggerVideo,
    tiggerScreen,
  }));

  // 创建发送端
  const createPeerSendonly = async () => {
    const peer = new RTCPeerConnection();

    peer.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    videoRef.current.srcObject = localStream;

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      peer.addTrack(track, localStream);
    });

    const offer = await peer.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });

    peer.setLocalDescription(offer);

    rtcPeerConnection.current = peer;

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp, true);
  };

  // 创建接受端
  const createPeerRecvonly = async () => {
    const peer = new RTCPeerConnection();

    peer.addEventListener("addstream", (e: any) => {
      videoRef.current.srcObject = e.stream;
      audioRef.current.srcObject = e.stream;
    });

    peer.addEventListener("icecandidate", (candidate) => {
      serverRef?.current?.invoke("ProcessCandidateAsync", id, candidate);
    });

    const offer = await peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    peer.setLocalDescription(offer);

    rtcPeerConnection.current = peer;

    serverRef?.current?.invoke("ProcessOfferAsync", id, offer.sdp, false);
  };

  React.useEffect(() => {
    if (isSelf) {
      createPeerSendonly();
    } else {
      createPeerRecvonly();
    }
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
});
