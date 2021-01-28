import React from 'react';

const Square = (props) => {
    return (<div className={ "square square-" + props.color } />);
}
 
export default Square;