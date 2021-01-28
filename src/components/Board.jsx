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
            for (let j = 0; j < 8; j++) {
                if (i % 2 === 0) {
                    iBoard.push(j % 2 === 0 ? "white" : "black")
                } else {
                    iBoard.push(j % 2 === 0 ? "black" : "white")
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
                        this.state.board.map((color, i) => (
                            <Square color={ color }/>
                        ))
                    }
                </div>
            </div>
        );
    }
}
 
export default Board;