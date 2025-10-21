const express = require('express');
const app = express();
const cors = require('cors');

const {createServer} = require('http');
const {Server} = require('socket.io');
const httpServer = createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

app.use(cors());
app.use(express.json());

const activeRooms = {};

const WORDS = [
    'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'fish', 'bird',
    'pizza', 'hamburger', 'computer', 'phone', 'guitar', 'piano', 'book', 'clock',
    'airplane', 'bicycle', 'flower', 'mountain', 'ocean', 'rainbow', 'bridge', 'castle'
];

io.on('connection', (socket) => {
    console.log(`New User Connected ${socket.id}`);

    socket.on('startGame', (data) => {
        const {roomId} = data
        const room = activeRooms[roomId]

        if(!room) {
            socket.emit(`gameError`, {message: `Room not found!`});
            return;
        }

        if(room.players.length < 2) {  /*number set to 2 for easier testing*/
            socket.emit('gameError', {message: `Not enough players to start!`});
            return;
        }

        room.gameState = `playing`

        const drawerIndex = Math.floor(Math.random() * room.players.length)
        const drawerId = room.players[drawerIndex]

        const word = WORDS[Math.floor(Math.random() * WORDS.length)]

        io.to(drawerId).emit('gameStart', {role: 'drawer', word})

        room.players.forEach(playerId => {
            if(playerId !== drawerId) {
                io.to(playerId).emit('gameStart', {role: 'guesser', word: word, wordLength: word.length})
            }
        })

        console.log(`Game started in room ${roomId}. Drawer: ${drawerId}, Word: ${word}`)
    })

    socket.on(`createRoom`, () => {
        const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();

        activeRooms[roomId] = {
            players: [socket.id],
            gameState: `waiting`
        }

        socket.join(roomId);
        console.log(`Room ${roomId} created by ${socket.id}`)

        socket.emit(`roomCreated`, {roomId});
    })

    socket.on(`joinRoom`, (data) => {
        const {roomId} = data

        if(activeRooms[roomId]) {
            activeRooms[roomId].players.push(socket.id)

            socket.join(roomId);

            console.log(`User ${socket.id} joined room ${roomId}`)

            socket.emit(`roomJoined`, {roomId})

            io.to(roomId).emit(`playerUpdate`, {
                playerCount: activeRooms[roomId].players.length,
            })
        } else {
            socket.emit(`roomError`, {message: `Room not found!`})
        }
    })

    socket.on('drawLine', (data) => {
        const {roomId, line} = data

        socket.to(roomId).emit('newLine', {line})
    })

    socket.on("drawLineUpdate", (data) => {
        const {roomId, lineIndex, points} = data
        socket.to(roomId).emit("lineUpdate", {lineIndex, points})
    })

    socket.on('undoLine', (data) => {
        const {roomId} = data

        socket.to(roomId).emit('lineUndone')
    })


    socket.on('disconnect', () => {
        console.log(`User Disconnected ${socket.id}`);
    })
})

httpServer.listen(2500, () => {
    console.log('Server is running on http://localhost:2500');
})