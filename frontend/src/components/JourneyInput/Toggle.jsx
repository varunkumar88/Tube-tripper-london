import React, { Component } from "react"
import {Stack} from "react-bootstrap";
import "./Toggle.css"

class Toggle extends Component {
    render() {
        return (
            <Stack direction="horizontal" gap={2}>
                <span>{this.props.leftLabel}</span>
                <label className="switch">
                    <input
                        name={this.props.name}
                        type="checkbox"
                        checked={this.props.checked}
                        onChange={this.props.onChange}
                    />
                    <span className="slider focus-ring"></span>
                </label>
                <span>{this.props.rightLabel}</span>
            </Stack>
        );
    }
}

export default Toggle
