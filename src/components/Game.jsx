import React, { Component } from 'react';
import Board from './Board'
import { BehaviorSubject } from 'rxjs'
import Square from './Square';
import Piece from './Piece';

export const gameSubject = new BehaviorSubject();

function connectToGame() {
    var gameServerIP = "ws://localhost:8080/ws"

    let socket = new WebSocket(gameServerIP)
    console.log("connecting to game...")

    socket.onopen = () => {
        console.log("connected to game.")
        socket.send("Hello.")
    }

    socket.onclose = (event) => {
        console.log("Disconnected from game.")
    }

    socket.onmessage = (message) => {
        console.log(message)
    }

    socket.onerror = (error) => {
        console.log("error:", error)
    }

    return socket
}

function updateGame(pieces) {
    gameSubject.next(pieces)
}

const THA_BOARD = new Map()

export function newBoard() {
    THA_BOARD["a1"] = { color: "white" }
    THA_BOARD["c1"] = { color: "white" }
    THA_BOARD["e1"] = { color: "white" }
    THA_BOARD["g1"] = { color: "white" }

    THA_BOARD["b2"] = { color: "white" }
    THA_BOARD["d2"] = { color: "white" }
    THA_BOARD["f2"] = { color: "white" }
    THA_BOARD["h2"] = { color: "white" }

    THA_BOARD["a3"] = { color: "white" }
    THA_BOARD["c3"] = { color: "white" }
    THA_BOARD["e3"] = { color: "white" }
    THA_BOARD["g3"] = { color: "white" }

    THA_BOARD["b6"] = { color: "black" }
    THA_BOARD["d6"] = { color: "black" }
    THA_BOARD["f6"] = { color: "black" }
    THA_BOARD["h6"] = { color: "black" }

    THA_BOARD["a7"] = { color: "black" }
    THA_BOARD["c7"] = { color: "black" }
    THA_BOARD["e7"] = { color: "black" }
    THA_BOARD["g7"] = { color: "black" }

    THA_BOARD["b8"] = { color: "black" }
    THA_BOARD["d8"] = { color: "black" }
    THA_BOARD["f8"] = { color: "black" }
    THA_BOARD["h8"] = { color: "black" }

    return THA_BOARD
}

export function movePiece(from, to) {
    if (THA_BOARD[to] == null && THA_BOARD[from].color === "white" && isValidWhite(from, to)){
        canJump(from , to)
        THA_BOARD[to] = THA_BOARD[from]
        THA_BOARD[from] = null        
        
    }
    else if (THA_BOARD[to] == null && THA_BOARD[from].color === "black" && isValidBlack(from, to)) {
        THA_BOARD[to] = THA_BOARD[from]
        THA_BOARD[from] = null
    }
    
    updateGame(THA_BOARD)
}
//if jumping checks to see if jump is valid
export function canJump(from, to){
    //variables from previous
    var toBeJumpedCol = from[0].charCodeAt(0) - 96
    var toBeJumpedRow = from[1].charCodeAt(0) - 48


    console.log("col : " + toBeJumpedCol) 
    console.log("row : " + toBeJumpedRow)

}

//checks if white can move to next position
export function isValidWhite(from, to){
    var move_valid_char = to[0].charCodeAt(0) - from[0].charCodeAt(0)
    var move_valid_num = to[1].charCodeAt(0) - from[1].charCodeAt(0)
    console.log("hell form white")
    if ((move_valid_num === 1) && (move_valid_char === 1 || move_valid_char === -1)){
        return true
    }
    
}
//checks if black can move to next position
export function isValidBlack(from,to){
    var move_valid_char = to[0].charCodeAt(0) - from[0].charCodeAt(0)
    var move_valid_num = to[1].charCodeAt(0) - from[1].charCodeAt(0)
    console.log("hell form black")
    if ((move_valid_num === -1) && (move_valid_char === 1 || move_valid_char === -1)){
        return true
    }
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameID: 0,
            connection: null
        }
    }

    componentDidMount() {
        this.setState({ connection: connectToGame() })
    }

    connectedToGame() {
        return this.state.connection != null
    }

    render() {
        return (
            <div>
                <h1>{ this.connectedToGame() ? "Connected to game." : "Not connected to game."}</h1>
                <div>
                    <Board />
                </div>
            </div>
        )
    }
}

export default Game