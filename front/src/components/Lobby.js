import React, {useEffect, useState} from 'react';
import {socket} from "../socket";

const Lobby = ({onGameStart}) => {

    const [roomId, setRoomId] = useState('')
    const [playerCount, setPlayerCount] = useState(1)
    const [status,  setStatus] = useState('idle')
    const [error, setError] = useState('')


    useEffect(() => {

        socket.on('gameStart', (data) => {
            onGameStart(roomId, data.role, data.word, data.wordLength)
        })

        socket.on('gameError', (data) => {
            setError(data.message)
        })

        socket.on('roomCreated', (data) => {
            setRoomId(data.roomId)
            setStatus('inRoom')
            setError('')
        });

        socket.on("roomJoined", (data) => {
            setRoomId(data.roomId)
            setStatus('inRoom')
            setError('')
        });

        socket.on("playerUpdate", (data) => {
            setPlayerCount(data.playerCount)
        });

        socket.on("roomError", (data) => {
            setError(data.message)
        });

        return () => {
            socket.off('roomCreated')
            socket.off('roomJoined')
            socket.off('playerUpdate')
            socket.off('roomError')
            socket.off('gameStart')
            socket.off('gameError')
        }
    }, [roomId, onGameStart]);

    const handleCreateRoom = () => {
        setStatus('creating')
        socket.emit(`createRoom`)
    }

    const handleJoinRoom = () => {
        if(!roomId.trim()) {
            setError(`Please enter a room code`)
            return
        }
        setStatus('joining')
        socket.emit("joinRoom", {roomId: roomId.trim().toUpperCase()})
    }

    const handleStartGame = () => {
        socket.emit('startGame', {roomId})
    }


    return (
        <div className={"Lobby"}>
            <h1>Draw & Guess</h1>

            {status === 'idle' && (
                <div>
                    <button onClick={handleCreateRoom}>Create a Room</button>
                    <div>OR</div>
                    <input
                        type="text"
                        placeholder="Enter Room Code"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        maxLength={4}
                    />
                    <button onClick={handleJoinRoom}>Join Room</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}

            {status === 'inRoom' && (
                <div>
                    <h2>Room: {roomId}</h2>
                    <p>Players in room: {playerCount}/3</p>
                    {playerCount < 3 && <p>Waiting for more players...</p>}
                    {playerCount <= 3 && <button onClick={handleStartGame}>Start Game</button>}
                </div>
            )}
        </div>
    );
};

export default Lobby;