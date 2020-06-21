const socketIO = require("socket.io");
const express = require("express");

const app = express();

//HTTP :
const http = require("http");
const { count } = require("console");
const server = http.createServer(app);

const io = socketIO(server);
const port = process.env.PORT || 8080;

let users = [];

io.on("connection", (socket) => {
  console.log(`A User Connected! Socket Id : ${socket.id}`);
  socket.emit("successFull-connected", socket.id);
  users.push(socket.id);
  console.log("users: ", users);

  socket.on("candidate", (userId, data) => {
    users.forEach((connectedUserId) => {
      if (userId !== connectedUserId) {
        io.to(connectedUserId).emit("candidate", data);
      }
    });
  });

  socket.on("offer", (userId, data) => {
    let count = 0;
    users.forEach((connectedUserId) => {
      if (userId !== connectedUserId) {
        console.log(`user with id: ${userId} answerd!`);
        console.log("destination: ", connectedUserId);
        io.to(connectedUserId).emit("offer", data);
        count = count + 1;
        console.log(count);
      }
    });
  });

  socket.on("answer", (userId, data) => {
    users.forEach((connectedUserId) => {
      if (userId !== connectedUserId) {
        console.log(`user with id: ${userId} answerd!`);
        console.log("destination: ", connectedUserId);
        io.to(connectedUserId).emit("answer", data);
      }
    });
  });

  socket.on("offerOrAnswer", (userId, data) => {
    users.forEach((connectedUserId) => {
      if (userId !== connectedUserId) {
        console.log(`user with id: ${userId} offerOrAnswer!`);
        console.log("destination: ", connectedUserId);
        io.to(connectedUserId).emit("offerOrAnswer", data);
      }
    });
  });

  socket.on("disconnect", () => {
    users.pop(socket.id);
    console.log(`User Disconnected! Socket Id : ${socket.id}`);
    console.log(users);
  });
});

app.use(express.static(__dirname + "/public"));

app.get("/mobileTest", (req, res) => {
  console.log("hey mobile user");
  res.send("hey mobile user");
});
console.log("hello");

server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
