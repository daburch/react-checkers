import React from 'react';

const Piece = (props) => {
    return (
        <div className={ "circle-" + props.color }> </div>
    );
}
 
export default Piece;