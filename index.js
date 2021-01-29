const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, { wsEngine: "ws" });
var ntpClient = require("ntp-client");
let offset_time;

let users = [];
let id = 0;
let start = {
  p_x: 0.0,
  p_y: 0.0,
  p_z: 0.0,
  r_x: 0.0,
  r_y: 0.0,
  r_z: 0.0,
  r_w: 0.0,
};


ntpClient.getNetworkTime("time.windows.com", 123, function(err, date) {
  if(err) {
      console.error(err);
      return;
  }

  console.log("Current time : ");
 offset_time = new Date() - date;

});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", async (socket) => {
  console.log("join");
  socket.on("ping", async () => {
    socket.emit("pong");
  });
  socket.on("join", async () => {
    //let 
    socket.emit("con", { date: new Date(Date.now() + offset_time).toJSON()});
    console.log("join");
    socket.emit("setObjId", { id: socket.id });
    start["id"] = socket.id;
    socket.broadcast.emit("enterNewPlayer", start);
    socket.broadcast.emit("getUserInfo", { id: socket.id });
    users[socket.id] = await socket.id;
    id++;
  });

  socket.on("disconnect", async () => {
    console.log("disconnect");
    socket.broadcast.emit("playerLeave", { id: socket.id });
    delete users[socket.id];
    if (users.length === 0) {
      id = 0;
    }
  });

  socket.on("sending-event", async (jsonObj) => {
    //console.log(jsonObj)

    socket.broadcast.to(jsonObj["room_id"]).emit(jsonObj["resiver"], jsonObj);
  });

  socket.on("sending-event-all", async (jsonObj) => {
    let resiever = jsonObj["resiver"];
    delete jsonObj["resiver"];
    //console.log(jsonObj);
    jsonObj["timestemp"] = new Date(Date.now() + offset_time).toJSON();
    socket.broadcast.emit(resiever, jsonObj);
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log("listening on *:3000");
});
