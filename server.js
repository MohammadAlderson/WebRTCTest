const socketIO = require("socket.io");
const express = require("express");
const fs = require("fs");

const app = express();

//HTTPS :
// const https = require("https");
// const key = fs.readFileSync("./key.pem");
// const cert = fs.readFileSync("./cert.pem");
// const server = https.createServer({ key: key, cert: cert }, app);

//HTTP :
const http = require("http");
const server = http.createServer(app);

const IO = socketIO(server);
const port = process.env.PORT || 8080;

IO.sockets.on("error", (e) => console.log(e));
IO.on("connection", (socket) => {
  let broadcaster;
  console.log(` ** A user with id: ${socket.id} joined! ** `);
  socket.on("requestCall", function (id) {
    console.log(` user with id: ${id} made a call request!!!`);
    socket.broadcast.emit("requestCall", socket.id);
  });

  socket.on("accpetCall", function (id) {
    console.log(`call request accpeted by: ${socket.id}`);
    socket.to(id).emit("accpetCall", socket.id);
  });
  socket.on("offer", (id, desc) => {
    console.log("offer", desc);
    socket.to(id).emit("offer", socket.id, desc);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    console.log(` xx A user with id: ${socket.id} Left! xx `);
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

app.use(express.static(__dirname + "/public"));

app.get("/ss", (req, res) => {
  console.log("hey mobile user");
  res.send("hey mobile user");
});
console.log("hello");

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
