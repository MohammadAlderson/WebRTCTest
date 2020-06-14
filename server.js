const socketIO = require("socket.io");
const express = require("express");
const fs = require("fs");

const app = express();
const http = require("http");
const server = http.createServer(app);

const IO = socketIO(server);
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/build"));
app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/build/index.html");
});

// keep a reference of all socket connections
let connectedPeers = new Map();
IO.sockets.on("error", (e) => console.log(e));
IO.on("connection", (socket) => {
  console.log(`a user with id: ${socket.id} joined!`);
  socket.emit("connection-success", { success: socket.id });

  connectedPeers.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log(`a user with id: ${socket.id} disconnected!`);
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

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
