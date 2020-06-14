let mediaDevices = navigator.mediaDevices;
let yourConnection, theirConnection;
let statusText = document.querySelector("#statusText");
let endCall = document.querySelector("#endCall");
let startCall = document.querySelector("#startCall");
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
  audio: true,
}; // This parameter expects an object of keys and values telling the browser how to look for and process streams coming from the connected devices

endCall.onclick = function () {
  yourConnection.close();
  theirConnection.close();
  statusText.innerHTML = "Call ended";
};
startCall.onclick = function () {
  startPeerConnection(streamVal);
};

function startPeerConnection(stream) {
  let config = {
    iceServers: [{ url: "stun:stun.1.google.com:19302" }],
  };

  try {
    console.log("entered try/catch block");
    yourConnection = new RTCPeerConnection(config);
    theirConnection = new RTCPeerConnection(config);
    console.log(yourConnection);
    console.log(theirConnection);
    // Setup stream listening
    yourConnection.addStream(stream);
    theirConnection.onaddstream = function (event) {
      console.log(event.stream);
      theirVideo.srcObject = event.stream;
    };

    // Setup ice handling
    yourConnection.onicecandidate = function (event) {
      if (event.candidate) {
        theirConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      }
    };
    theirConnection.onicecandidate = function (event) {
      if (event.candidate) {
        yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
      }
    };

    // Begin the offer
    yourConnection.createOffer().then(function (offer) {
      statusText.innerHTML = "Calling...";
      yourConnection.setLocalDescription(offer);
      theirConnection.setRemoteDescription(offer);

      theirConnection.createAnswer().then(function (answer) {
        statusText.innerHTML = "Answered";
        theirConnection.setLocalDescription(answer);
        yourConnection.setRemoteDescription(answer);
      });
    });
  } catch (e) {
    console.log(e);
  }
}

// with the enumerateDevices method we handle multiple input devices
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
    //The callback function should accept one parameter: where the stream is coming from and the media devices on the computer
    console.log("stream", stream);
    selfVideo.srcObject = stream;
    streamVal = stream;
    // startPeerConnection(stream);
  })
  .catch(function (err) {
    let errParagraph = document.querySelector("#showError");
    errParagraph.innerHTML = err;
    console.log("Raised an error when capturing: ", error);
  });
