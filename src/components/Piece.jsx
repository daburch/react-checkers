import React from 'react';
import { useDrag } from 'react-dnd'

export default function Piece(props) {
    const [, drag] = useDrag({
        item: {
            type: 'piece',
            pos: props.pos
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    })

    return <div className={ "piece circle-" + props.color + (props.isKing ? " king" : "") } ref={ drag } />;
}