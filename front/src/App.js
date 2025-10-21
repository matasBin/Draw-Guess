import './App.css';
import Canvas from "./components/Canvas";
import {useEffect, useState} from "react";
import {socket} from "./socket";
import Lobby from "./components/Lobby";

function App() {

    const [gameState, setGameState] = useState('lobby')
    const [gameData, setGameData] = useState(null)

    const handleGameStart = (roomId, role, word, wordLength) => {
        setGameState('playing')
        setGameData({roomId, role, word, wordLength})
    }

    const handleBackToLobby = () => {
        setGameState('lobby')
        setGameData(null)
    }

    useEffect(() => {
        socket.on("connection", (data) => {
            console.log(data)
        })
    }, []);


    return (
        <div className="App">
            {
                gameState === 'lobby' ?
                    <Lobby onGameStart={handleGameStart}/>
                    :
                    <Canvas gameData={gameData}
                            onBackToLobby={handleBackToLobby}></Canvas>
            }
        </div>
    );
}

export default App;
