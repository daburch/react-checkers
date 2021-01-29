import React, { Component } from 'react';
import Piece from './Piece';

class Square extends Component {
    constructor(props) {
        super(props);

        this.state = { squareID: props.squareID, color: props.color, piece: props.piece };
    }

    buildPiece() {
        if (this.props.piece === "none") {
            return ""
        }
        
        return <Piece color={ this.props.piece } />
    }

    render() {
        return (
            <div id={ this.state.squareID } className={ "square square-" + this.state.color }>
                { this.buildPiece() }
            </div>
        );
    }
}
 
export default Square;