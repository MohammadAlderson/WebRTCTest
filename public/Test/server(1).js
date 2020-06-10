const https = require("https");
const socketIO = require("socket.io");
const express = require("express");
const fs = require("fs");

const app = express();

const key = fs.readFileSync("./key.pem");
const cert = fs.readFileSync("./cert.pem");

const server = https.createServer({ key: key, cert: cert }, app);
const IO = socketIO(server);
const port = process.env.PORT || 8080;

IO.on("connection", function (socket) {
  socket.on("requestCall", function (id) {
    socket.broadcast.emit("requestCall", socket.id);
  });

  socket.on("accpetCall", function (id) {
    console.log("call accepted", id);
    console.log("taker id: ", socket.id);
    socket.to(id).emit("accpetCall", socket.id);
  });

  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnectPeer", (id) => {
    socket.to(id).emit("disconnectPeer", socket.id);
  });
  console.log("a user connected");
  console.log("socket", socket.id);

  socket.on("err", function (err) {
    console.log(err);
  });
});

IO.on("error", function (err) {
  console.log(err);
});

app.use(express.static(__dirname + "/public"));

app.get("/ss", (req, res) => {
  res.send("this is an secure server");
});
console.log("hello");

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
