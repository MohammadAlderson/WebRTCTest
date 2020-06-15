let socket = io.connect(window.location.origin);

let mediaDevices = navigator.mediaDevices;
let yourConnection, theirConnection;
let statusText = document.querySelector("#statusText");
let endCallBtn = document.querySelector("#endCall");
let acceptCallBtn = document.querySelector("#acceptCall");
let selfVideo = document.querySelector("#selfVideo");
let streamerVideo = document.querySelector("#streamerVideo");
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
  audio: true,
}; // This parameter expects an object of keys and values telling the browser how to look for and process streams coming from the connected devices
let config = {
  iceServers: [{ url: "stun:stun.1.google.com:19302" }],
};

let peerConnection;
let senderId;
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

mediaDevices
  .getUserMedia(constraints)
  .then(function (stream) {
    selfVideo.srcObject = stream;
    streamVal = stream;
  })
  .catch(function (e) {
    socket.emit("err", e);
  });

socket.on("requestCall", function (data) {
  senderId = data;
  console.log("got call request, sender id: ", data);
  statusText.innerHTML = "Someone is calling";
  acceptCallBtn.disabled = false;
  //   peerConnection.addStream(streamVal);
});

socket.on("offer", (id, description) => {
  peerConnection = new RTCPeerConnection(config);
  streamVal.getTracks().forEach((track) => {
    console.log(track);
    peerConnection.addTrack(track, streamVal);
  });
  peerConnection.ontrack = (event) => {
    console.log(event.streams[0]);
    console.log(event.streams);
    streamerVideo.srcObject = event.streams[0];
  };
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then((sdp) => {
      console.log(sdp);
      peerConnection.setLocalDescription(sdp);
    })
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    })
    .catch(function (e) {
      console.log(e);
    });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", senderId, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch((e) => console.error(e));
});

socket.on("disconnectPeer", () => {
  peerConnection.close();
});

endCallBtn.onclick = function () {
  socket.emit("disconnectPeer", senderId);
};

acceptCallBtn.onclick = function () {
  socket.emit("accpetCall", senderId);
  statusText.innerHTML = "******* Call accepted *******";
};
