(this.webpackJsonpwebrtc=this.webpackJsonpwebrtc||[]).push([[0],{33:function(e,t,n){e.exports=n(69)},38:function(e,t,n){},66:function(e,t){},69:function(e,t,n){"use strict";n.r(t);var o=n(0),c=n.n(o),r=n(26),i=n.n(r),a=(n(38),n(27)),s=n(28),d=n(31),l=n(29),f=n(32),u=n(30),h=n.n(u),m=function(e){function t(e){var n;return Object(a.a)(this,t),(n=Object(d.a)(this,Object(l.a)(t).call(this,e))).componentDidMount=function(){n.socket=h.a.connect("https://45f88544f453.ngrok.io"),n.socket.on("connection-success",(function(e){console.log(e)})),n.socket.on("offerOrAnswer",(function(e){n.textref.value=JSON.stringify(e),n.pc.setRemoteDescription(new RTCSessionDescription(e))})),n.socket.on("candidate",(function(e){n.pc.addIceCandidate(new RTCIceCandidate(e))}));n.pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]}),n.pc.onicecandidate=function(e){e.candidate&&n.sendToPeer("candidate",e.candidate)},n.pc.oniceconnectionstatechange=function(e){console.log(e)},n.pc.ontrack=function(e){n.remoteVideoref.current.srcObject=e.streams[0]};navigator.mediaDevices.getUserMedia({video:!0,options:{mirror:!0}}).then((function(e){window.localStream=e,n.localVideoref.current.srcObject=e,n.pc.addStream(e)})).catch((function(e){console.log("getUserMedia Error: ",e)}))},n.sendToPeer=function(e,t){n.socket.emit(e,{socketID:n.socket.id,payload:t})},n.createOffer=function(){console.log("Offer"),n.pc.createOffer({offerToReceiveVideo:1}).then((function(e){n.pc.setLocalDescription(e),n.sendToPeer("offerOrAnswer",e)}))},n.createAnswer=function(){console.log("Answer"),n.pc.createAnswer({offerToReceiveVideo:1}).then((function(e){n.pc.setLocalDescription(e),n.sendToPeer("offerOrAnswer",e)}))},n.setRemoteDescription=function(){var e=JSON.parse(n.textref.value);n.pc.setRemoteDescription(new RTCSessionDescription(e))},n.addCandidate=function(){n.candidates.forEach((function(e){console.log(JSON.stringify(e)),n.pc.addIceCandidate(new RTCIceCandidate(e))}))},n.localVideoref=c.a.createRef(),n.remoteVideoref=c.a.createRef(),n.socket=null,n.candidates=[],n}return Object(f.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this;return c.a.createElement("div",null,c.a.createElement("video",{style:{width:240,height:240,margin:5,backgroundColor:"black"},ref:this.localVideoref,autoPlay:!0,muted:!0}),c.a.createElement("video",{style:{width:240,height:240,margin:5,backgroundColor:"black"},ref:this.remoteVideoref,autoPlay:!0}),c.a.createElement("br",null),c.a.createElement("button",{onClick:this.createOffer},"Offer"),c.a.createElement("button",{onClick:this.createAnswer},"Answer"),c.a.createElement("br",null),c.a.createElement("textarea",{style:{width:450,height:40},ref:function(t){e.textref=t}}))}}]),t}(o.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(c.a.createElement(m,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[33,1,2]]]);
//# sourceMappingURL=main.dbaa92be.chunk.js.map