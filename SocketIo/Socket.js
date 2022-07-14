const SocketIO = require("socket.io");

const socketio = function (server) {
  const io = SocketIO(server);

  io.on("connection", () => {});
};
module.exports = socketio;
