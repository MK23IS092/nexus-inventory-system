import React from 'react';
import PropTypes from 'prop-types';

const ControlPanel = ({ onAction }) => {
    return (
        <div className="control-panel">
            <div className="panel-header">
                <h3>CONTROL MATRIX</h3>
            </div>
            <div className="controls">
                <button className="btn btn-primary" onClick={() => onAction('add')}>
                    <span className="btn-icon">+</span>
                    <span className="btn-text">ADD ITEM</span>
                </button>
                <button className="btn btn-secondary" onClick={() => onAction('remove')}>
                    <span className="btn-icon">-</span>
                    <span className="btn-text">REMOVE ITEM</span>
                </button>
                <button className="btn btn-tertiary" onClick={() => onAction('modify')}>
                    <span className="btn-icon">⚙</span>
                    <span className="btn-text">MODIFY ITEM</span>
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;

ControlPanel.propTypes = {
    onAction: PropTypes.func.isRequired,
};
