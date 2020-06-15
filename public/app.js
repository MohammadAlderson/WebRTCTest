const socket = io.connect(window.location.origin);
let myId, sdpValue;
socket.on("successFull-connected", (id) => {
  myId = id;
});

let remoteStream, localStream;

let selfVideo = document.querySelector("#selfVideo");
let remoteVideo = document.querySelector("#theirVideo");
let statusText = document.querySelector("#statusText");
let startCallBtn = document.querySelector("#startCall");
let accpetCallBtn = document.querySelector("#accpetCall");
accpetCallBtn.disabled = true;

let constraints = { audio: false, video: true };

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((stream) => {
    selfVideo.srcObject = stream;
    localStream = stream;
    stream.getTracks().forEach((track) => {
      // console.log(track);
      peerConnection.addTrack(track, localStream);
    });
  })
  .catch((e) => console.log(e));

// console.log(localStream);

const peerConnection = new RTCPeerConnection(pc_config);

peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("candidate", myId, event.candidate);
  }
};

peerConnection.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

// peerConnection.ontrack = (e) => {
//   remoteStream = e.streams[0];
// };

peerConnection.oniceconnectionstatechange = (e) => {
  console.log("oniceconnectionstatechange", e);
};

function createOffer() {
  peerConnection
    .createOffer()
    .then((sdp) => {
      sdpValue = sdp;
      peerConnection.setLocalDescription(sdp);
    })
    .then(function () {
      console.log("creating offer");
      statusText.innerHTML = "Calling...";
      socket.emit("offer", myId, sdpValue);
      accpetCallBtn.disabled = true;
    })
    .catch((e) => console.log(e));
}

function createAnwer() {
  peerConnection
    .createAnswer()
    .then((sdp) => {
      sdpValue = sdp;
      return peerConnection.setLocalDescription(sdp);
    })
    .then(function () {
      socket.emit("answer", myId, sdpValue);
    })
    .catch((e) => console.log(e));
}

socket.on("offer", (sdp) => {
  console.log("on offer");
  statusText.innerHTML = "Some one is Calling!";
  startCallBtn.disabled = true;
  accpetCallBtn.disabled = false;
  peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on("answer", (sdp) => {
  console.log("on answer");
  statusText.innerHTML = "User Answered";
  peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on("candidate", (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

startCallBtn.onclick = function () {
  createOffer();
};

accpetCallBtn.onclick = function () {
  createAnwer();
};
