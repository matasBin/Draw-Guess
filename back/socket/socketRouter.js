
const { handleConnection } = require('./connectionHandlers')

const { handleCreateRoom,
        handleJoinRoom } = require('./roomHandlers')

const { handleStartGame,
        handleDrawLine,
        handleDrawLineUpdate,
        handleUndoLine } = require('./gameHandlers')

const activeRooms = {};

const registerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        handleConnection(io, socket)

        socket.on('createRoom', () => handleCreateRoom(io, socket, activeRooms))
        socket.on('startGame', handleStartGame(io, socket, activeRooms))
        socket.on('joinRoom', handleJoinRoom(io, socket, activeRooms))
        socket.on('drawLine', handleDrawLine(socket))
        socket.on('drawLineUpdate', handleDrawLineUpdate(socket))
        socket.on('undoLine', handleUndoLine(socket))
    })
}

module.exports = { registerSocketHandlers }
