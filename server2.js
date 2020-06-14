// const express = require("express");
// const app = express();
// const http = require("http").Server(app);
// const io = require("socket.io")(http);

// const port = process.env.PORT || 8080;

// app.use(express.static(__dirname + "/build"));

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/build/index.html");
// });

// app.listen(port, () => {
//   console.log(`server is running on port : ${port}`);
// });

// const peers = io.of("/webrtcPeer");

// let connectedPeers = new Map();

// peers.on("connection", (socket) => {
//   //   console.log("user connected with socket id: ", socket.id);
//   connectedPeers.set(socket.id, socket);
//   socket.on("disconnect", () => {
//     console.log(`user with id: ${socket.id} , disconnected!`);
//     connectedPeers.delete(socket.id);
//   });
// });

////////////////////////////////////////////////////

const socketIO = require("socket.io");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const io = socketIO(server);
const port = process.env.PORT || 8080;

// app.get('/', (req, res) => res.send('Hello World!!!!!'))

//https://expressjs.com/en/guide/writing-middleware.html
// app.use(express.static(__dirname + "/build"));
// app.get("/", (req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.sendFile(__dirname + "/build/index.html");
// });

// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
// const peers = io.of("/webrtcPeer");

// keep a reference of all socket connections
let connectedPeers = new Map();
io.sockets.on("error", (e) => console.log(e));
io.sockets.on("connection", (socket) => {
  console.log(`a user with id: ${socket.id} joined!`);
  socket.emit("connection-success", { success: socket.id });

  connectedPeers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log("disconnected");
    connectedPeers.delete(socket.id);
  });

  socket.on("offerOrAnswer", (data) => {
    // send to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload.type);
        socket.emit("offerOrAnswer", data.payload);
      }
    }
  });

  socket.on("candidate", (data) => {
    // send candidate to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload);
        socket.emit("candidate", data.payload);
      }
    }
  });
});

server.listen(port, () => console.log(`app is running on port ${port}!`));
