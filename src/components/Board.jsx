import React, { Component } from 'react';
import Square from './Square'

// Represents a checker board
class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pieces: props.pieces, 
            squares: []
        }
    }

    componentDidMount() {
        this.initBoard()
    }

    initBoard() {
        var b = []
        var p = this.state.pieces

        for (let row = 7; row >= 0; row--) {
            for (let col = 0; col <= 7; col++) {
                var squareID = String.fromCharCode(97 + col) + (row + 1)

                var piece = p[squareID]

                var squareColor = (row + col) % 2 === 0 ? "black" : "white"
                var pieceColor = piece == null ? "none" : piece.color

                b.push({ squareID: squareID, color: squareColor, piece: pieceColor })
            }
        }

        // set the board state
        this.setState({
            squares: b
        })
    }

    render() {
        return( 
            <div className="board-container">
                <div className="board">
                    { 
                        this.state.squares.map((data) => (
                            <Square key={ data.squareID } squareID={ data.squareID } color={ data.color } piece={ data.piece }/>
                        ))
                    }
                </div>
            </div>
        );
    }
}
 
export default Board;