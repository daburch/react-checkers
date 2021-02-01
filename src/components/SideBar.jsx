import React from 'react';

function buildStatus(props) {
    if (props.connected) {
        if (props.playerColor == null) {
            return <p>Waiting for opponent...</p>
        } else {
            return <p>You are playing {props.playerColor}.</p>
        }
    } else {
        return <p>You are not connected.</p>
    }
}

function buildButton(props) {
    if (props.connected) {
        return <button onClick={ props.disconnect }>Disconnect</button>
    } else {
        return <button onClick={ props.connect }>Join Game</button>
    }
}

export default function SideBar(props) {
    return <div className="sidebar">
        { buildStatus(props) }
        { buildButton(props) }
    </div>
}