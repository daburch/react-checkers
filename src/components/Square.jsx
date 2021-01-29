import React, { Component } from 'react';
import Piece from './Piece';

class Square extends Component {
    state = {
        color: "white",
        piece: "none"
    }

    constructor(props) {
        super(props);
        this.state = { color: props.color, piece: props.piece };
    }

    buildPiece() {
        if (this.props.piece === "none") {
            return ""
        }
        return <Piece color={ this.props.piece } />
    }

    render() {
        return (
            <div className={ "square square-" + this.state.color }> 
                { this.buildPiece() }
            </div>
        );
    }
}
 
export default Square;