let socket = io.connect(window.location.origin);
console.log(window.location.origin);
let mediaDevices = navigator.mediaDevices;
let yourConnection, theirConnection;
let statusText = document.querySelector("#statusText");
let endCall = document.querySelector("#endCall");
let startCallBtn = document.querySelector("#startCall");
let selfVideo = document.querySelector("#selfVideo");
let theirVideo = document.querySelector("#theirVideo");
let isFront = false;
let facingMode = isFront ? "user" : "environment";
let streamVal;
let constraints = {
  video: {
    facingMode,
    width: 150,
    height: 200,
    frameRate: 60,
  },
  audio: false,
}; // This parameter expects an object of keys and values telling the browser how to look for and process streams coming from the connected devices
let config = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

let peerConnection;
let peerID;
let peerConnections = {};

startCallBtn.onclick = function () {
  startCall();
  statusText.innerHTML = "Calling...";
};

socket.on("accpetCall", function (id) {
  peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  console.log("call accepted by: ", id);
  statusText.innerHTML = "******* Call accepted *******";

  streamVal.getTracks().forEach((track) => {
    console.log(track);
    peerConnection.addTrack(track, streamVal);
  });
  peerConnection.ontrack = (event) => {
    console.log(event.streams[0]);
    console.log(event.streams);

    theirVideo.srcObject = event.streams[0];
  };
  peerConnection
    .createOffer()
    .then(function (offer) {
      console.log("offer", offer);
      peerConnection.setLocalDescription(offer);
    })
    .then(function () {
      socket.emit("offer", id, peerConnection.localDescription);
    })
    .catch(function (e) {
      console.log(e);
    });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", socket.id, event.candidate);
    }
  };
});

socket.on("answer", (id, description) => {
  console.log(peerConnections);
  peerConnections[id].setRemoteDescription(description);
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

mediaDevices.enumerateDevices().then(function (devices) {
  let videoSource = null;
  let audioSource = null;
  devices.forEach(function (device) {
    if (device.kind === "audioinput") {
      audioSource = device.deviceId;
    } else if (device.kind === "videoinput") {
      videoSource = device.deviceId;
    }
  });
  constraints.video = {
    ...constraints.video,
    deviceId: videoSource,
  };
  constraints.audio = {
    ...constraints.audio,
    deviceId: audioSource,
  };
});

mediaDevices.getUserMedia(constraints).then(function (stream) {
  selfVideo.srcObject = stream;
  streamVal = stream;
  console.log("streamVal:", streamVal);
});

function startCall() {
  socket.emit("requestCall", socket.id);
  console.log(socket.id);
}
