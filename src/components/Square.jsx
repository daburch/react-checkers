import React from 'react';
import Piece from './Piece';
import { useDrop } from 'react-dnd';

function buildPiece(piece, pos) {
    if (piece == null) {
        return ""
    }
    
    return <Piece color={ piece.color } pos={ pos } isKing={ piece.isKing } />
}

export default function Square(props) {
    const [, drop] = useDrop({
        accept: 'piece',
        drop: (item) => {
            props.sendMoveToServer(item.pos, props.squareID)
        }
    })

    return (
        <div id={ props.squareID } className={ "square square-" + props.color } ref={ drop }>
            { buildPiece(props.piece, props.squareID) }
        </div>
    );
}