import React, { Component } from 'react';
import Square from './Square'

class Board extends Component {
    state = {
        board: []
    }

    componentDidMount() {
        this.initBoard()
    }

    initBoard() {
        var board = []

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (i % 2 === 0) {
                    board.push(j % 2 === 0 ? "white" : "black")
                } else {
                    board.push(j % 2 === 0 ? "black" : "white")
                }
                
            }
        }

        this.state.board.map((square, i) => (
            console.log(square, i)
        ))

        this.setState({
            board: board
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