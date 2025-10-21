
const handleCreateRoom = (io, socket, activeRooms) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();

    activeRooms[roomId] = {
        players: [socket.id],
        gameState: `waiting`
    }

    socket.join(roomId);
    console.log(`Room ${roomId} created by ${socket.id}`)

    socket.emit(`roomCreated`, {roomId});
}

const handleJoinRoom = (io, socket, activeRooms) => {
    return (data) => {
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

    }
}

module.exports = { handleCreateRoom, handleJoinRoom }