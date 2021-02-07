import React from 'react';

function buildConnectionStatus(props) {
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

function buildTurnStatus(props) {
    if (!props.connected || props.playerColor == null) {
        return ""
    } else if (props.isTurn) {
        return <p>It is your turn</p>
    } else {
        return <p>It is Opponent's turn</p>
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
        { buildConnectionStatus(props) }
        { buildTurnStatus(props) }
        { buildButton(props) }
    </div>
}