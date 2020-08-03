import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import Mic from "./assets/mic.png";

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

const RTCHostComponent = (props) => {
  const [peers, setPeers] = useState([]);
  const [voiceState, setVoiceState] = useState(false);
  const [dropdownDisplay, setDropdownDisplay] = useState(false);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = props.roomID;

  useEffect(() => {
    console.log(voiceState);
    if (voiceState) {
      if (userVideo.current.srcObject) {
        userVideo.current.srcObject.getTracks()[0].enabled = true;
      } else {
        socketRef.current = io.connect(
          "wss://syncfast.macrotechsolutions.us:5240"
        );
        navigator.mediaDevices
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
              const item = peersRef.current.find(
                (p) => p.peerID === payload.id
              );
              item.peer.signal(payload.signal);
            });
          });
      }
    } else {
      if (userVideo.current.srcObject) {
        userVideo.current.srcObject.getTracks()[0].enabled = false;
      }
    }
  }, [voiceState]);

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

  function showDropdown() {
    if (dropdownDisplay == "block") {
      setDropdownDisplay("none");
    } else {
      setDropdownDisplay("block");
    }
  }

  function hideDropdown() {
    if (dropdownDisplay == "block") {
        setDropdownDisplay("none");
    }
  }

  return (
    <div>
      <div className="dropdown">
        <button
          onClick={() => {
            showDropdown();
          }}
          className="dropbtn"
        >
          <img src={Mic} height={40} width={40} />
        </button>
        <div
          id="myDropdown"
          className="dropdown-content"
          style={{ display: `${dropdownDisplay}` }}
        >
          <button
            id="voiceButton"
            className="toolsButton"
            onClick={() => {
              if (voiceState == false) {
                setVoiceState(true);
              } else {
                setVoiceState(false);
              }
            }}
          >
            {!voiceState ? "Enable Voice Channel" : "Disable Voice Channel"}
          </button>
        </div>
      </div>

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

export default RTCHostComponent;
