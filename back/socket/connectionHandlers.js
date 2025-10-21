

const handleConnection = (io, socket) => {
    console.log(`New User Connected ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User Disconnected ${socket.id}`);
        //TODO: Add logic to remove the player from activeRooms
    })
}

module.exports = { handleConnection }