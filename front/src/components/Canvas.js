import React, {useEffect, useRef, useState} from 'react';
import {Layer, Line, Stage, Text} from "react-konva";
import {socket} from "../socket";

const Canvas = ({gameData, onBackToLobby}) => {

    const {roomId, role, word, wordLength} = gameData;

    const colorInput = useRef("#030303");
    const strokeWidthInput = useRef(5);

    const [tool, setTool] = useState('pen');
    const [lines, setLines] = useState([]);
    const isDrawing = useRef(false);


    useEffect(() => {
        socket.on('newLine', (data) => {
            setLines(prevLines => [...prevLines, data.line])
        })

        socket.on('lineUpdate', (data) => {
            const {lineIndex, points} = data
            setLines(prevLines => {
                const newLines = [...prevLines]
                const updatedLine = {...newLines[lineIndex], points: points}
                newLines[lineIndex] = updatedLine
                return newLines
            })
        })

        socket.on('lineUndone', () => {
            setLines(prevLines => prevLines.slice(0, -1))
        })

        return () => {
            socket.off('newLine')
            socket.off('lineUpdate')
            socket.off('lineUndone')
        }
    }, []);

    const handleMouseDown = (e) => {
        if (role !== 'drawer') {
            return
        }

        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();

        const newLine = {
            tool,
            points: [pos.x, pos.y],
            stroke: colorInput.current.value,
            strokeWidth: Number(strokeWidthInput.current.value),
        }

        setLines(prevLines => [...prevLines, newLine])

        console.log(lines)
        socket.emit('drawLine', {roomId, line: newLine})
    }

    const handleMouseMove = (e) => {
        if (!isDrawing.current || role !== 'drawer') {
            return
        }
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();

        setLines(prevLines => {
            const newLines = [...prevLines]
            const lastLineIndex = newLines.length - 1;

            newLines[lastLineIndex].points = newLines[lastLineIndex].points.concat([point.x, point.y])

            socket.emit('drawLineUpdate', {roomId, lineIndex: lastLineIndex, points: newLines[lastLineIndex].points})

            return newLines
        })

    }

    const handleMouseUp = () => {
        isDrawing.current = false;
    }

    const handleUndo = () => {
        if (role !== 'drawer') {
            return
        }

        setLines(prevLines => {
            const newLines = prevLines.slice(0, -1)
            socket.emit('undoLine', {roomId})
            return newLines
        })
    }

    const [isCorrect, setIsCorrect] = useState(false)
    const guessInput = useRef()

    const handleGuess = () => {
        if (role !== 'guesser') {
            return
        }
        if (guessInput.current.value === word) {
            console.log("Correct!")
            setIsCorrect(true)
        } else {
            console.log(guessInput.current.value)
            console.log(word)
            console.log(gameData)
            console.log("Wrong!")
        }
    }


    return (
        <div className={"Canvas"}>
            <button onClick={onBackToLobby}>Leave Game</button>
            {
                role === 'drawer' ?
                    <h2>You are drawing: {word}</h2>
                    :
                    <>
                        <h2>{isCorrect ? `The Word was: ${word}` : `Guess the word: ${'_ '.repeat(wordLength)}`}</h2>
                        <input type="text" placeholder={"Guess the word"} ref={guessInput}/>
                        <button disabled={isCorrect} onClick={handleGuess}>Guess</button>
                    </>

            }
            {
                role === 'drawer' &&
                <>
                    <select value={tool}
                            onChange={(e) => {
                                setTool(e.target.value);
                            }}>
                        <option value="pen">Pen</option>
                        <option value="eraser">Eraser</option>
                    </select>
                    <input type="color" ref={colorInput}/>
                    <select ref={strokeWidthInput}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </>
            }
            <button onClick={handleUndo}>Undo</button>
            <Stage width={600}
                   height={window.innerHeight}
                   onMouseDown={handleMouseDown}
                   onMouseMove={handleMouseMove}
                   onMouseUp={handleMouseUp}
                   onTouchStart={handleMouseDown}
                   onTouchMove={handleMouseMove}
                   onTouchEnd={handleMouseUp}>
                <Layer>
                    <Text text={"Just start drawing"} x={5} y={30}/>
                    {
                        lines.map((line, index) => (
                            <Line
                                key={index}
                                points={line.points}
                                stroke={line.stroke}
                                strokeWidth={line.strokeWidth}
                                tension={0.5}
                                lineCap={"round"}
                                lineJoin={"round"}
                                globalCompositeOperation={
                                    line.tool === "eraser" ? "destination-out" : "source-over"
                                }
                            />

                        ))
                    }
                </Layer>
            </Stage>

        </div>
    );
};

export default Canvas;