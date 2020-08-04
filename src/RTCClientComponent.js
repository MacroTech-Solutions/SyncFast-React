import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import Mic from "./assets/mic.png";
import Unmute from "./assets/unmute.png";
import Websocket from "react-websocket";

const StyledVideo = styled.video`
  height: 40%;
  width: 50%;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return (
    <StyledVideo playsInline autoPlay ref={ref} style={{ display: "none" }} />
  );
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const RTCClientComponent = (props) => {
  const [peers, setPeers] = useState([]);
  const [clientMic, setClientMic] = useState(false);
  const [voiceState, setVoiceState] = useState(false);
  const [init, setInit] = useState(true);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.roomID;

  useEffect(() => {
    async function startFunction() {
            socketRef.current = io.connect(
        "wss://syncfast.macrotechsolutions.us:5240"
      );
      await navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          userVideo.current.srcObject = stream;
          socketRef.current.emit("join room", roomID);
          socketRef.current.on("all users", (users) => {
            const peers = [];
            users.forEach((userID) => {
              const peer = createPeer(userID, socketRef.current.id, stream);
              peersRef.current.push({
                peerID: userID,
                peer,
              });
              peers.push(peer);
            });
            setPeers(peers);
          });

          socketRef.current.on("user joined", (payload) => {
            const item = peersRef.current.find(
              (p) => p.peerID === payload.callerID
            );
            if (!item) {
              const peer = addPeer(payload.signal, payload.callerID, stream);
              peersRef.current.push({
                peerID: payload.callerID,
                peer,
              });
              setPeers((users) => [...users, peer]);
            }
          });

          socketRef.current.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          });
        });
      userVideo.current.srcObject.getTracks()[0].enabled = false;
      let response = await fetch(
        "https://syncfast.macrotechsolutions.us:9146/http://localhost/clientJoin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accesscode: props.accessCode,
          },
        }
      );
      let result = await response.json();
      setClientMic(result.clientmic == "true");
    }

    if (init) {
      startFunction();
      setInit(false);
    } else {
        console.log(clientMic);
      if (!clientMic) {
        userVideo.current.srcObject.getTracks()[0].enabled = false;
      } else if (voiceState) {
        userVideo.current.srcObject.getTracks()[0].enabled = true;
      } else {
        userVideo.current.srcObject.getTracks()[0].enabled = false;
      }
    }
  }, [clientMic, voiceState]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function handleData(data) {
    if (data === `enableMic${props.firebasePresentationKey}`) {
      setClientMic(true);
      setVoiceState(false);
    } else if (data === `disableMic${props.firebasePresentationKey}`) {
      setClientMic(false);
      setVoiceState(false);
    }
  }

  function toggleMute() {
    if (!clientMic) {
      setVoiceState(false);
    } else if (voiceState) {
      setVoiceState(false);
    } else {
      setVoiceState(true);
    }
  }

  return (
    <div>
      <button id="clientMicBtn"
        style={{ display: clientMic ? "inline" : "none" }}
        onClick={() => {
          toggleMute();
        }}
      >
        <img src={!voiceState ? Mic : Unmute} height={40} width={40} />
        {!voiceState ? "Unmute" : "Mute"}
      </button>
      <Websocket
        url="wss://syncfast.macrotechsolutions.us:4211"
        onMessage={(data) => {
          handleData(data);
        }}
      />
      <StyledVideo
        muted
        ref={userVideo}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} style={{ display: "none" }} />;
      })}
    </div>
  );
};

export default RTCClientComponent;
