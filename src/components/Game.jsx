import React, { Component } from 'react';
import Board from './Board'
import { BehaviorSubject } from 'rxjs'
import SideBar from './SideBar';

export const gameSubject = new BehaviorSubject();

function updateGame(pieces) {
    gameSubject.next(pieces)
}

function validateCell(cell) {
    var c = cell[0].charCodeAt(0) - 97
    var r = cell[1].charCodeAt(0) - 48
    var v = !(c < 0 || c > 7 || r < 0 || r > 7)

    return [v, c, r]
}

export function newBoard() {
    var b = {}

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
            turn: 0,
            status: "disconnected",
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
            this.setState({ status: "connected", board: new newBoard(), turn: 0, playerColor: null })
            updateGame(this.state.board)
        }
    
        socket.onclose = (event) => {
            console.log("Disconnected from game.")
            this.setState({ status: "disconnected", board: new newBoard(), turn: 0, playerColor: null })
            updateGame(this.state.board)
        }
    
        socket.onmessage = (message) => {
            console.log(message)
    
            var data = JSON.parse(message.data)
            var body = JSON.parse(data.body)
    
            if (body.action === "move") {
                this.movePiece(body.from, body.to)
            } else if (body.action === "assignColor") {
                this.setState( { playerColor: body.color, status: "in-progress" } )
            } else if (body.action === "updateStatus") {
                console.log("updating status")
                this.setState( { status: body.status } )
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
            if (this.moveIsValid(from, to)) {
                this.state.gameConnection.send(`{ "action": "move", "from": "${from}", "to": "${to}" }`)
            } else {
                console.debug("Invalid move")
            }
        } else {
            console.debug("not connected to server")
        }
    }

    surrender() {
        var winner = this.state.playerColor === "white" ? "black" : "white"
        this.sendStatusUpdateToServer(`win ${winner}`)
    }

    sendStatusUpdateToServer(status) {
        if (this.state.gameConnection != null) {
            this.state.gameConnection.send(`{ "action": "updateStatus", "status": "${status}" }`)
        } else {
            console.debug("not connected to server")
        }
    }

    movePiece(from, to) {
        var b = this.state.board

        b[to] = b[from]
        delete b[from]

        this.incrementTurn()

        updateGame(b)
    }

    incrementTurn() {
        this.setState({ turn: this.state.turn + 1 })
        if (!this.playerHasValidMove()) {
            console.log("game over.")
            this.surrender()
        }
    }

    moveIsValid(from, to) {
        const [fValid, fCol, fRow] = validateCell(from)
        const [tValid, tCol, tRow] = validateCell(to)

        // from and/or to cell is not on the board
        if (!fValid || !tValid) {
            return false
        }

        var cDelta = tCol - fCol
        var rDelta = tRow - fRow
        var b = this.state.board

        return (this.isTurn() &&                                    // can only move on correct turn
                b[from] != null &&                                  // source square has a piece
                b[to] == null &&                                    // target square is empty
                b[from].color === this.state.playerColor &&         // can only move assigned pieces
                (cDelta === 1 || cDelta === -1) &&                  // 1 space left/right
                ((b[from].color === "white" && rDelta === 1) ||     // white can only move 1 -> 8 by one space
                (b[from].color === "black" && rDelta === -1)))      // black can only move 8 -> 1 by one space
    }

    isTurn() {
        if (this.state.playerColor === "white") {
            return this.state.turn % 2 === 0
        } else {
            return this.state.turn % 2 === 1
        }
    }

    playerHasValidMove() {
        if (!this.isTurn()) {
            return true
        }

        console.log(this.state.board)
        for (let loc in this.state.board) {
            if (this.pieceHasValidMove(this.state.board[loc], loc)) {
                return true
            }
        }

        return false
    }

    pieceHasValidMove(piece, location) {
        if (piece.color !== this.state.playerColor) {
            return false
        }

        var ps = this.getPossibleSquares(location)
        return ps.some(function(value, index, array) {
            return this.moveIsValid(location, value)
        }.bind(this))
    }

    getPossibleSquares(location) {
        const [valid, col, row] = validateCell(location)
        if (!valid) {
            return []
        }

        var ps = []

        if (col < 7 && row < 7) {
            // up-right: 1, 1
            ps.push(String.fromCharCode(97 + col + 1) + (row + 1))
        }

        if (col > 0 && row < 7) {
            // up-left: -1, 1
            ps.push(String.fromCharCode(97 + col - 1) + (row + 1))
        }

        if (col < 7 && row > 0) {
            // down-right: 1, -1
            ps.push(String.fromCharCode(97 + col + 1) + (row - 1))
        }

        if (col > 0 && row > 0) {
            // -1, -1
            ps.push(String.fromCharCode(97 + col - 1) + (row - 1))
        }

        console.log(`possible squares for ${location}: ${ps}`)

        return ps
    }

    render() {
        return (
            <div className="game">
                <SideBar 
                    connected={ this.state.gameConnection != null } 
                    playerColor={ this.state.playerColor }
                    gameStatus={ this.state.status }
                    isTurn={ this.isTurn() }
                    connect={ this.connect.bind(this) }
                    disconnect={ this.disconnect.bind(this) }
                    surrender={ this.surrender.bind(this) }
                    />

                <Board 
                    isReversed={ this.state.playerColor === "black" } 
                    sendMoveToServer={ this.sendMoveToServer.bind(this) } 
                    />
            </div>
        )
    }
}

export default Game