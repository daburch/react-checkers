import React, { Component } from 'react';
import Square from './Square'
import { gameSubject, newBoard } from './Game'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function buildBoard(pieces) {
    var b = []

    for (let row = 7; row >= 0; row--) {
        for (let col = 0; col <= 7; col++) {
            var squareID = String.fromCharCode(97 + col) + (row + 1)

            var piece = pieces[squareID]

            var squareColor = (row + col) % 2 === 0 ? "black" : "white"
            var pieceColor = piece == null ? "none" : piece.color

            b.push({ squareID: squareID, color: squareColor, piece: pieceColor })
        }
    }

    return b
}

// Represents a checker board
class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            squares: []
        }
    }

    componentDidMount() {
        var b = newBoard()
        this.setState({
            pieces: b,
            squares: buildBoard(b)
        })

        gameSubject.subscribe((p) => {
            if (p != null) {
                // set the board state
                this.setState({
                    pieces: p,
                    squares: buildBoard(p)
                })
            }
        })
    }

    render() {
        return( 
            <DndProvider backend={HTML5Backend}>
                <div className="board-container">
                    <div className="board">
                        {
                            this.state.squares.map((data) => (
                                <Square key={ data.squareID } squareID={ data.squareID } color={ data.color } piece={ data.piece } sendMoveToServer={ this.props.sendMoveToServer } />
                            ))
                        }
                    </div>
                </div>
            </DndProvider>
        );
    }
}

export default Board;