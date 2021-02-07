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
        }
    
        socket.onerror = (error) => {
            console.log("error:", error)
        }
    
        this.setState({ gameConnection: socket })
    }

    disconnect() {
        if (this.state.gameConnection != null) {
            this.state.gameConnection.close()
            this.setState({ status: "disconnected", gameConnection: null, playerColor: null })
        }
    }

    connected() {
        return this.state.gameConnection != null
    }

    gameIsActive() {
        return this.state.status === "in-progress"
    }

    sendMoveToServer(from, to) {
        if (!this.connected()) {
            console.log("Can't send move: Not connected to server")
            return
        }

        if (!this.gameIsActive()) {
            console.log("Can't send move: Game is not active")
            return
        }

        if (!this.isTurn()) {
            console.log("Can't send move: Not your turn.")
            return
        }

        const [valid, reason, isJump] = this.moveIsValid(from, to)
        if (!valid) {
            console.log(`invalid move: ${from} => ${to} : ${reason}`)
            return
        }

        if (isJump !== this.playerCanJump()) {
            console.log(`invalid move: ${from} => ${to} : Must take jump`)
            return
        }

        // game and move are valid; Send the move to the game server
        this.state.gameConnection.send(`{ "action": "move", "from": "${from}", "to": "${to}" }`)
    }

    surrender() {
        if (!this.connected()) {
            console.log("Can't surrender: Not connected to server")
            return
        }

        if (!this.gameIsActive()) {
            console.log("Can't surrender: Game is not active")
            return
        }

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
        const [, fCol, fRow] = validateCell(from)
        const [, tCol, tRow] = validateCell(to)

        // column and row deltas
        var cDelta = tCol - fCol
        var rDelta = tRow - fRow

        var b = this.state.board
        b[to] = b[from]
        delete b[from]

        // move is a jump
        if ((cDelta === 2 || cDelta === -2) && (rDelta === 2 || rDelta === -2)) {
            var attackedCell = String.fromCharCode(97 + fCol + (cDelta / 2)) + (fRow + (rDelta / 2))
            delete b[attackedCell]
        }

        // promote king
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
        if (!this.playerCanMove()) {
            console.log("game over.")
            this.surrender()
        }
    }

    /**
     * Check if the given move is valid.
     * 
     * @param {Number} from source cell
     * @param {Number} to   target cell
     * @returns {Array} boolean indicating if the move is valid, string indicating the reason the move is invalid, boolean indicating if the move is a jump
     */
    moveIsValid(from, to) {
        const [fValid, fCol, fRow] = validateCell(from)
        const [tValid, tCol, tRow] = validateCell(to)

        if (!fValid) {
            return [ false, "from cell out of range", false ]
        }

        if (!tValid) {
            return [ false, "to cell out of range", false ]
        }

        var b = this.state.board

        // source square must have a piece and that piece must match the player color
        var piece = b[from]
        if (piece == null) {
            return [ false, "no piece to move", false ]
        }

        // piece must belong to the active player
        if (piece.color !== this.state.playerColor) {
            return [ false, "wrong color piece", false ]
        }

        // target square must be empty
        if (b[to] != null) {
            return [ false, "target cell not empty", false ]
        }

        // column and row deltas
        var cDelta = tCol - fCol
        var rDelta = tRow - fRow

        // move is a jump
        if ((cDelta === 2 || cDelta === -2) && (rDelta === 2 || rDelta === -2)) {
            var intermediateCell = String.fromCharCode(97 + fCol + (cDelta / 2)) + (fRow + (rDelta / 2))
            var attackedPiece = b[intermediateCell]

            // must be jumping an enemy piece
            if (attackedPiece == null) {
                return [ false, "can't jump empty square", true ]
            } else if (attackedPiece.color === this.state.playerColor) {
                return [ false, "can't jump friendly piece", true ]
            }

            if (!piece.isKing) {
                // white can only jump 1 -> 8 by two spaces
                // black can only jump 8 -> 1 by two spaces
                return [ ((piece.color === "white" && rDelta === 2) ||                            
                            (piece.color === "black" && rDelta === -2)), "invalid row delta", true ]
            } else {
                return [ true, "", true ]
            }
        }
        
        // can only move 1 space left / right unless jumping
        if (!(cDelta === 1 || cDelta === -1)) {
            return [ false, "invalid column delta", false ]
        }

        if (piece.isKing) {
            // kings can move in either direction
            return [ (rDelta === 1 || rDelta === -1), "invalid row delta", false ]
        } else {
            // white can only move 1 -> 8 by one space
            // black can only move 8 -> 1 by one space
            return [ ((piece.color === "white" && rDelta === 1) ||                            
                        (piece.color === "black" && rDelta === -1)), "invalid row delta", false ]
        }
    }

    isTurn() {
        if (this.state.playerColor === "white") {
            return this.state.turn % 2 === 1
        } else {
            return this.state.turn % 2 === 0
        }
    }

    playerCanMove() {
        if (!this.isTurn()) {
            return true
        }

        for (let loc in this.state.board) {
            if (this.pieceCanMove(this.state.board[loc], loc)) {
                return true
            }
        }

        return false
    }

    playerCanJump() {
        if (!this.isTurn()) {
            return true
        }

        for (let loc in this.state.board) {
            if (this.pieceCanJump(this.state.board[loc], loc)) {
                return true
            }
        }

        return false
    }

    pieceCanMove(piece, location) {
        if (piece.color !== this.state.playerColor) {
            return false
        }

        var ps = this.getPossibleMoves(location)
        return ps.some(function(value, index, array) {
            const [isValid, ] = this.moveIsValid(location, value)
            return isValid
        }.bind(this))
    }

    pieceCanJump(piece, location) {
        if (piece.color !== this.state.playerColor) {
            return false
        }

        var ps = this.getPossibleJumps(location)
        return ps.some(function(value, index, array) {
            const [isValid, ] = this.moveIsValid(location, value)
            return isValid
        }.bind(this))
    }

    getPossibleMoves(location) {
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
            // down-left: -1, -1
            ps.push(String.fromCharCode(97 + col - 1) + (row - 1))
        }

        return ps
    }

    getPossibleJumps(location) {
        const [valid, col, row] = validateCell(location)
        if (!valid) {
            return []
        }

        var ps = []

        if (col < 6 && row < 6) {
            // up-right jump: 2, 2
            ps.push(String.fromCharCode(97 + col + 2) + (row + 2))
        }

        if (col > 1 && row < 6) {
            // up-left jump: -2, 2
            ps.push(String.fromCharCode(97 + col - 2) + (row + 2))
        }

        if (col < 6 && row > 1) {
            // down-right jump: 2, -2
            ps.push(String.fromCharCode(97 + col + 2) + (row - 2))
        }

        if (col > 1 && row > 1) {
            // down-left jump: -1, -1
            ps.push(String.fromCharCode(97 + col - 2) + (row - 2))
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
                    turn={ this.state.turn }
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