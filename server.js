const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let rooms = {};

io.on("connection", (socket) => {

console.log("Player connected");

socket.on("createRoom", () => {

let roomCode = Math.random().toString(36).substring(2,6).toUpperCase();

rooms[roomCode] = {
players:[socket.id],
called:[],
turn:0,
gameOver:false
};

socket.join(roomCode);

socket.emit("roomCreated",roomCode);

});

socket.on("joinRoom",(roomCode)=>{

if(rooms[roomCode] && rooms[roomCode].players.length < 2){

rooms[roomCode].players.push(socket.id);

socket.join(roomCode);

io.to(roomCode).emit("startGame");

io.to(roomCode).emit("turnChange",rooms[roomCode].players[0]);

}

});

socket.on("callNumber",({roomCode,number})=>{

let room = rooms[roomCode];

if(!room || room.gameOver) return;

let currentPlayer = room.players[room.turn];

if(socket.id !== currentPlayer) return;

if(!room.called.includes(number)){

room.called.push(number);

io.to(roomCode).emit("numberCalled",number);

room.turn = (room.turn + 1) % 2;

io.to(roomCode).emit("turnChange",room.players[room.turn]);

}

});

socket.on("gameWin",(roomCode)=>{

let room = rooms[roomCode];

if(!room) return;

room.gameOver=true;

io.to(roomCode).emit("gameOver");

});

});

server.listen(3000,()=>{

console.log("Server running on port 3000");

});