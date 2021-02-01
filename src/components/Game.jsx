import React, { Component } from 'react';
import Board from './Board'
import { BehaviorSubject } from 'rxjs'
import SideBar from './SideBar';

export const gameSubject = new BehaviorSubject();
const THA_BOARD = new Map()
var gameConnection;

function connectToGame(game) {
    var gameServerIP = "ws://localhost:8080/ws"

    let socket = new WebSocket(gameServerIP)
    console.log("connecting to game...")

    socket.onopen = () => {
        console.log("connected to game.")
    }

    socket.onclose = (event) => {
        console.log("Disconnected from game.")
    }

    socket.onmessage = (message) => {
        console.log(message)

        var data = JSON.parse(message.data)
        var body = JSON.parse(data.body)

        if (body.action === "move") {
            console.log("got a move message.")
            movePiece(body.from, body.to, false)
        } else if (body.action === "assignColor") {
            game.setState( { playerColor: body.color } )
        }
    }

    socket.onerror = (error) => {
        console.log("error:", error)
    }

    return socket
}

function updateGame(pieces) {
    gameSubject.next(pieces)
}

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

export function sendMoveToServer(from, to) {
    gameConnection.send(`{ "action": "move", "from": "${from}", "to": "${to}"}`)
}

function movePiece(from, to) {        
    THA_BOARD[to] = THA_BOARD[from]
    THA_BOARD[from] = null
    
    updateGame(THA_BOARD)
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameID: 0
        }
    }

    componentDidMount() {
        if (gameConnection == null) {
            gameConnection = connectToGame(this)
        }
    }

    render() {
        return (
            <div className="game">
                <SideBar />
                <Board />
            </div>
        )
    }
}

export default Game