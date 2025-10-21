const express = require('express');
const app = express();
const cors = require('cors');

const {createServer} = require('http');
const {Server} = require('socket.io');
const {registerSocketHandlers} = require("./socket/socketRouter");
const httpServer = createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

app.use(cors());
app.use(express.json());

registerSocketHandlers(io)

httpServer.listen(2500, () => {
    console.log('Server is running on http://localhost:2500');
})