import React, {useEffect, useState} from 'react';
import {socket} from "../socket";
import Shuffle from "./ShuffleText";
import "./Shuffle.css"

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
                <Shuffle
                    text="Draw & Guess"
                    shuffleDirection="right"
                    duration={1}
                    animationMode="evenodd"
                    shuffleTimes={1}
                    ease="power3.out"
                    stagger={0.03}
                    threshold={0.1}
                    triggerOnce={false}
                    triggerOnHover={true}
                    respectReducedMotion={true}
                />

            {status === 'idle' && (
                <div>
                    <button className={"btn"} onClick={handleCreateRoom}>Create a Room</button>
                    <div className={"divider"}>OR</div>
                    <input
                        className={"text-input"}
                        type="text"
                        placeholder="Enter Room Code"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        maxLength={4}
                    />
                    <button className={"btn btn-secondary"} onClick={handleJoinRoom}>Join Room</button>
                    {error && <p className={"error-message"}>{error}</p>}
                </div>
            )}

            {status === 'inRoom' && (
                <div>
                    <h2>Room: {roomId}</h2>
                    <p>Players in room: {playerCount}/3</p>
                    {playerCount < 3 && <p>Waiting for more players...</p>}
                    {playerCount <= 3 && <button className={"btn btn-success"} onClick={handleStartGame}>Start Game</button>}
                </div>
            )}
        </div>
    );
};

export default Lobby;