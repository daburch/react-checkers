import React, { Component } from 'react';
import Board from './Board'
import { BehaviorSubject } from 'rxjs'
import SideBar from './SideBar';

export const gameSubject = new BehaviorSubject();

function updateGame(pieces) {
    gameSubject.next(pieces)
}

// determine if a given cellID falls within board constraints
function validateCell(cellID) {
    var c = cellID[0].charCodeAt(0) - 97
    var r = cellID[1].charCodeAt(0) - 48
    var v = !(c < 0 || c > 7 || r < 1 || r > 8)

    return [v, c, r]
}

export function newBoard() {
    var b = {}

    b["a1"] = { color: "white", isKing: false }
    b["c1"] = { color: "white", isKing: false }
    b["e1"] = { color: "white", isKing: false }
    b["g1"] = { color: "white", isKing: false }

    b["b2"] = { color: "white", isKing: false }
    b["d2"] = { color: "white", isKing: false }
    b["f2"] = { color: "white", isKing: false }
    b["h2"] = { color: "white", isKing: false }

    b["a3"] = { color: "white", isKing: false }
    b["c3"] = { color: "white", isKing: false }
    b["e3"] = { color: "white", isKing: false }
    b["g3"] = { color: "white", isKing: false }

    b["b6"] = { color: "black", isKing: false }
    b["d6"] = { color: "black", isKing: false }
    b["f6"] = { color: "black", isKing: false }
    b["h6"] = { color: "black", isKing: false }

    b["a7"] = { color: "black", isKing: false }
    b["c7"] = { color: "black", isKing: false }
    b["e7"] = { color: "black", isKing: false }
    b["g7"] = { color: "black", isKing: false }

    b["b8"] = { color: "black", isKing: false }
    b["d8"] = { color: "black", isKing: false }
    b["f8"] = { color: "black", isKing: false }
    b["h8"] = { color: "black", isKing: false }

    return b
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            turn: 1,
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
            this.setState({ status: "connected", board: new newBoard(), turn: 1, playerColor: null })
            updateGame(this.state.board)
        }
    
        socket.onclose = (event) => {
            console.log("Disconnected from game.")
            this.setState({ status: "disconnected", board: new newBoard(), turn: 1, playerColor: null })
            updateGame(this.state.board)
        }
    
        socket.onmessage = (message) => {
            var data = JSON.parse(message.data)
            var body = JSON.parse(data.body)
    
            switch (body.action) {
                case "move":
                    console.log(`move action recieved: ${data.body}`)
                    this.movePiece(body.from, body.to)
                    break;

                case "assignColor":
                    console.log(`assignColor action recieved: ${data.body}`)
                    this.setState( { playerColor: body.color, status: "in-progress" } )
                    break;

                case "updateStatus":
                    console.log(`updateStatus action recieved: ${data.body}`)
                    this.setState( { status: body.status } )
                    break;

                default:
                    console.log(`unknown action recieved: ${data.body}`)
                    break;
            }



            // if (body.action === "move") {
            //     this.movePiece(body.from, body.to)
            // } else if (body.action === "assignColor") {
            //     this.setState( { playerColor: body.color, status: "in-progress" } )
            // } else if (body.action === "updateStatus") {
            //     console.log("updating status")
            //     this.setState( { status: body.status } )
            // }
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

    connected() {
        return this.state.gameConnection != null
    }

    sendMoveToServer(from, to) {
        if (!this.connected()) {
            console.log("Can't send move: Not connected to server")
            return
        }

        if (!this.isTurn()) {
            console.log("Can't send move: Not your turn.")
            return
        }

        const [valid, reason] = this.moveIsValid(from, to)
        if (!valid) {
            console.log(`invalid move: ${from} => ${to} : ${reason}`)
            return
        }

        this.state.gameConnection.send(`{ "action": "move", "from": "${from}", "to": "${to}" }`)
    }

    surrender() {
        var winner = this.state.playerColor === "white" ? "black" : "white"
        this.sendStatusUpdateToServer(`win ${winner}`)
    }

    sendStatusUpdateToServer(status) {
        if (!this.connected()) {
            console.log("Can't update status: Not connected to server")
            return
        }

        this.state.gameConnection.send(`{ "action": "updateStatus", "status": "${status}" }`)
    }

    movePiece(from, to) {
        var b = this.state.board

        b[to] = b[from]
        delete b[from]

        // promote king
        const [, , tRow] = validateCell(to)
        if (tRow === 8 && b[to].color === "white") {
            b[to].isKing = true
        } else if (tRow === 1 && b[to].color === "black") {
            b[to].isKing = true
        }

        this.incrementTurn()

        updateGame(b)
    }

    incrementTurn() {
        this.setState({ turn: this.state.turn + 1 })
        console.log(`turn: ${this.state.turn}`)
        if (!this.playerHasValidMove()) {
            console.log("game over.")
            this.surrender()
        }
    }

    // check if the current player could make move the piece from b.[from] to b.[to]
    moveIsValid(from, to) {
        const [fValid, fCol, fRow] = validateCell(from)
        const [tValid, tCol, tRow] = validateCell(to)

        if (!fValid) {
            return [ false, "from cell out of range" ]
        }

        if (!tValid) {
            return [ false, "to cell out of range" ]
        }

        var b = this.state.board

        // source square must have a piece and that piece must match the player color
        var piece = b[from]
        if (piece == null) {
            return [ false, "no piece to move" ]
        }

        if (piece.color !== this.state.playerColor) {
            return [ false, "wrong color piece" ]
        }

        // target square must be empty
        if (b[to] != null) {
            return [ false, "target cell not empty" ]
        }

        // column and row deltas
        var cDelta = tCol - fCol
        var rDelta = tRow - fRow
        
        // can only move 1 space left / right unless jumping
        if (!(cDelta === 1 || cDelta === -1)) {
            return [ false, "invalid column delta" ]
        }

        if (piece.isKing) {
            // kings can move in either direction
            return [ (rDelta === 1 || rDelta === -1), "invalid row delta" ]
        } else {
            // white can only move 1 -> 8 by one space
            // black can only move 8 -> 1 by one space
            return [ ((piece.color === "white" && rDelta === 1) ||                            
                        (piece.color === "black" && rDelta === -1)), "invalid row delta" ]
        }
    }

    isTurn() {
        if (this.state.playerColor === "white") {
            return this.state.turn % 2 === 1
        } else {
            return this.state.turn % 2 === 0
        }
    }

    playerHasValidMove() {
        if (!this.isTurn()) {
            return true
        }

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
            const [isValid, ] = this.moveIsValid(location, value)
            return isValid
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