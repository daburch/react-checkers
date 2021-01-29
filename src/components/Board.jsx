import React, { Component } from 'react';
import Square from './Square'

// Represents a checker board
class Board extends Component {
    state = {
        board: []
    }

    componentDidMount() {
        // initialize the board
        this.initBoard()
    }

    initBoard() {
        var iBoard = []

        // initialize the board square colors
        for (let i = 0; i < 8; i++) {
            var iPiece
            if (i <= 2) {
                iPiece = "white"
            } else if (i >= 5) {
                iPiece = "black"
            } else {
                iPiece = "none"
            }

            for (let j = 0; j < 8; j++) {
                if (i % 2 === 0) {
                    iBoard.push(j % 2 === 0 ? { color: "white", piece: "none" } : { color: "black", piece: iPiece })
                } else {
                    iBoard.push(j % 2 === 0 ? { color: "black", piece: iPiece } : { color: "white", piece: "none" })
                }
            }
        }

        // set the board state
        this.setState({
            board: iBoard
        })
    }

    render() {
        return( 
            <div className="board-container">
                <div className="board">
                    { 
                        this.state.board.map((data, i) => (
                            <Square color={ data.color } piece={ data.piece }/>
                        ))
                    }
                </div>
            </div>
        );
    }
}
 
export default Board;