const WORDS = [
    'cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star', 'fish', 'bird',
    'pizza', 'hamburger', 'computer', 'phone', 'guitar', 'piano', 'book', 'clock',
    'airplane', 'bicycle', 'flower', 'mountain', 'ocean', 'rainbow', 'bridge', 'castle'
];

const handleStartGame = (io, socket, activeRooms) => {
    return (data) => {
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
    }
}

const handleDrawLine = (socket) => {
    return (data) => {
        const {roomId, line} = data
        socket.to(roomId).emit('newLine', {line})
    }
}

const handleDrawLineUpdate = (socket) => {
    return (data) => {
        const {roomId, lineIndex, points} = data
        socket.to(roomId).emit("lineUpdate", {lineIndex, points})
    }
}

const handleUndoLine = (socket) => {
    return (data) => {
        const {roomId} = data
        socket.to(roomId).emit('lineUndone')
    }
}

module.exports = {
    handleStartGame,
    handleDrawLine,
    handleDrawLineUpdate,
    handleUndoLine
}