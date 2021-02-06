import React, { Component } from 'react';
import Board from './Board'
import { BehaviorSubject } from 'rxjs'
import SideBar from './SideBar';

export const gameSubject = new BehaviorSubject();

function updateGame(pieces) {
    gameSubject.next(pieces)
}

export function newBoard() {
    var b = new Map()

    b["a1"] = { color: "white" }
    b["c1"] = { color: "white" }
    b["e1"] = { color: "white" }
    b["g1"] = { color: "white" }

    b["b2"] = { color: "white" }
    b["d2"] = { color: "white" }
    b["f2"] = { color: "white" }
    b["h2"] = { color: "white" }

    b["a3"] = { color: "white" }
    b["c3"] = { color: "white" }
    b["e3"] = { color: "white" }
    b["g3"] = { color: "white" }

    b["b6"] = { color: "black" }
    b["d6"] = { color: "black" }
    b["f6"] = { color: "black" }
    b["h6"] = { color: "black" }

    b["a7"] = { color: "black" }
    b["c7"] = { color: "black" }
    b["e7"] = { color: "black" }
    b["g7"] = { color: "black" }

    b["b8"] = { color: "black" }
    b["d8"] = { color: "black" }
    b["f8"] = { color: "black" }
    b["h8"] = { color: "black" }

    return b
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameID: 0,
            turn: 0,
            gameConnection: null,
            playerColor: null,
            board: new newBoard(),
        }
    }

    connect() {
        if (this.state.gameConnection != null) {
            console.debug("already connected")
            return
        }

        console.log("connecting to game...")

        var gameServerIP = "ws://localhost:8080/ws"

        let socket = new WebSocket(gameServerIP)
    
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
                this.movePiece(body.from, body.to)
            } else if (body.action === "assignColor") {
                this.setState( { playerColor: body.color } )
            }
        }
    
        socket.onerror = (error) => {
            console.log("error:", error)
        }
    
        this.setState({ gameConnection: socket })
    }

    disconnect() {
        if (this.state.gameConnection != null) {
            this.state.gameConnection.close()
            this.setState({ gameConnection: null, playerColor: null })
        }
    }

    sendMoveToServer(from, to) {
        if (this.state.gameConnection != null) {
            if (this.isValid(from, to)) {
                this.state.gameConnection.send(`{ "action": "move", "from": "${from}", "to": "${to}"}`)
            } else {
                console.debug("Invalid move")
            }
        }
    }

    movePiece(from, to) {
        var b = this.state.board

        b[to] = b[from]
        b[from] = null

        this.setState({ turn: this.state.turn + 1 })

        updateGame(b)
    }

    isValid(from, to){
        var colDist = to[0].charCodeAt(0) - from[0].charCodeAt(0)
        var rowDist = to[1].charCodeAt(0) - from[1].charCodeAt(0)
        var b = this.state.board

        return (this.isTurn() &&                                    // can only move on correct turn
                b[from] != null &&                                  // source square has a piece
                b[to] == null &&                                    // target square is empty
                b[from].color === this.state.playerColor &&         // can only move assigned pieces
                (colDist === 1 || colDist === -1) &&                // 1 space left/right
                ((b[from].color === "white" && rowDist === 1) ||    // white can only move 1 -> 8 by one space
                (b[from].color === "black" && rowDist === -1)))     // black can only move 8 -> 1 by one space
    }

    isTurn() {
        if (this.state.playerColor === "white") {
            return this.state.turn % 2 === 0
        } else {
            return this.state.turn % 2 === 1
        }
    }

    render() {
        return (
            <div className="game">
                <SideBar connected={ this.state.gameConnection != null } playerColor={ this.state.playerColor } isTurn={ this.isTurn() } connect={ this.connect.bind(this) } disconnect={ this.disconnect.bind(this) }/>
                <Board isReversed={ this.state.playerColor === "black" } sendMoveToServer={ this.sendMoveToServer.bind(this) } />
            </div>
        )
    }
}

export default Game