import React, { createRef } from "react";
import io from "socket.io-client";
// import "./App.css";

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.localVideoRef = createRef();
    this.remoteVideoRef = createRef();
    this.textAreaRef = createRef();
    const config = {
      iceServers: [
        // {
        //   urls: 'stun:[STUN_IP]:[PORT]',
        //   'credentials': '[YOR CREDENTIALS]',
        //   'username': '[USERNAME]'
        // },
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };
    this.socket = null;
    this.state = {
      pc: new RTCPeerConnection(config),
    };
  }

  componentDidMount() {
    console.log("window url:", window.location.origin);
    this.socket = io.connect("http://localhost:8080");
    console.log("this.socket", this.socket);

    this.socket.on("success-connection", (success) => {
      console.log(success);
    });
    // io.connect("https://2f9db5b7040c.ngrok.io/webrtcPeer");
    console.log(this.state.pc);
    const { pc } = this.state;
    pc.onicecandidate = (event) => {
      if (event.candidate) console.log(JSON.stringify(event.candidate));
    };

    pc.oniceconnectionstatechange = (event) => console.log(event);

    // pc.onaddstream = (event) => (this.remoteVideoRef.srcObject = event.stream);
    pc.ontrack = (event) => (this.remoteVideoref.srcObject = event.streams[0]);

    const constraints = { video: true, audio: false };

    const success = (stream) => {
      this.localVideoRef.srcObject = stream;
      // pc.addstream(stream);
      stream.getTracks().forEach((track) => {
        console.log(track);
        pc.addTrack(track, stream);
      });
    };

    const failure = (e) => {
      console.log(e);
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(success)
      .catch(failure);
  }

  createOffer = () => {
    const { pc } = this.state;
    console.log("Offer", pc);
    pc.createOffer()
      .then((sdp) => {
        console.log(JSON.stringify(sdp));
        pc.setLocalDescription(sdp);
      })
      .catch((e) => console.log(e));
  };

  setRemoteDesc = () => {
    const { pc } = this.state;
    const desc = JSON.stringify(this.textAreaRef.value);
    pc.setRemoteDescription(new RTCSessionDescription(desc));
  };

  createAnswer = () => {
    const { pc } = this.state;
    console.log("Answer");
    pc.createAnswer()
      .then((sdp) => {
        console.log("createAnswer sdp", JSON.stringify(sdp));
        pc.setLocalDescription(sdp);
      })
      .catch((e) => console.log(e));
  };

  addCandidate = () => {
    const { pc } = this.state;
    const candidate = JSON.stringify(this.textAreaRef.value);
    pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  render() {
    return (
      <div className="App">
        <div
          style={{ display: "flex", flexDirection: "row", marginBottom: 10 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Local</span>
            <video
              style={{
                width: 250,
                height: 250,
                margin: 5,
                backgroundColor: "black",
              }}
              ref={(ref) => (this.localVideoRef = ref)}
              autoPlay
            ></video>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span>Remote</span>
            <video
              style={{
                width: 250,
                height: 250,
                margin: 5,
                backgroundColor: "black",
              }}
              ref={(ref) => (this.remoteVideoRef = ref)}
              autoPlay
            ></video>
          </div>
        </div>
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <button onClick={this.createOffer}>Offer</button>
          <button onClick={this.createAnswer}>Answer</button>
          <textarea ref={(ref) => (this.textAreaRef = ref)}></textarea>
          <button onClick={this.setRemoteDesc}>Set Remote Desc</button>
          <button onClick={this.addCandidate}>Add Candidate</button>
        </div>
      </div>
    );
  }
}

export default App;
