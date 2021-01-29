import React, { Component } from 'react';
import Board from './Board'

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gameID: 0,
            connection: null,
            pieces: this.initializeGamePieces()
        }
    }

    componentDidMount() {
        // this.setState({ connection: this.connectToGame() })
    }

    initializeGamePieces() {
        var p = {};

        p["a1"] = { color: "white" }
        p["c1"] = { color: "white" }
        p["e1"] = { color: "white" }
        p["g1"] = { color: "white" }

        p["b2"] = { color: "white" }
        p["d2"] = { color: "white" }
        p["f2"] = { color: "white" }
        p["h2"] = { color: "white" }

        p["a3"] = { color: "white" }
        p["c3"] = { color: "white" }
        p["e3"] = { color: "white" }
        p["g3"] = { color: "white" }

        p["b6"] = { color: "black" }
        p["d6"] = { color: "black" }
        p["f6"] = { color: "black" }
        p["h6"] = { color: "black" }

        p["a7"] = { color: "black" }
        p["c7"] = { color: "black" }
        p["e7"] = { color: "black" }
        p["g7"] = { color: "black" }

        p["b8"] = { color: "black" }
        p["d8"] = { color: "black" }
        p["f8"] = { color: "black" }
        p["h8"] = { color: "black" }

        return p
    }

    connectToGame() {
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
    }

    connectedToGame() {
        return this.state.connection != null
    }

    movePiece(from, to) {
        var p = this.state.pieces
        
        var pf = p[from]
        p[from] = null
        p[to] = pf
    }

    render() {
        return (
            <div>
                <h1>{ this.connectedToGame() ? "Connected to game." : "Not connected to game."}</h1>
                <Board pieces={ this.state.pieces }/>
            </div>
        )
    }
}

export default Game