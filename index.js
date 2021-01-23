const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];

let start = {
    "p_x": 0.0,
    "p_y": 0.0,
    "p_z": 0.0,
    "r_x": 0.0,
    "r_y": 0.0,
    "r_z": 0.0,
    "r_w": 0.0,
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', async(socket) => {
    socket.emit("connect")
    socket.on("join", async()=>{
        console.log("join")
        io.sockets.sockets;
       // console.log(users);
       start["id"] = socket.id;
        socket.broadcast.emit("enterNewPlayer",start);
        socket.broadcast.emit("getUserInfo",{id:socket.id})
         users[socket.id] =await socket.id;
    })

    socket.on("disconnect", async()=>{
        console.log("disconnect");
        socket.broadcast.emit("playerLeave", {id:socket.id});
        delete(users[socket.id]);
    })

    socket.on("sending-event", async (jsonObj) => {
        socket.broadcast.to(jsonObj["room_id"]).emit(jsonObj["resiver"], jsonObj);
      });

      socket.on("sending-event-all", async (jsonObj) => {
        socket.broadcast.emit(jsonObj["resiver"], jsonObj);
      });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});