import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${type}`}>
            <div className="notification-content">
                <strong>{message}</strong>
                <div className="notification-timestamp">{new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
};

export default Notification;

Notification.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(['success', 'error', 'info']),
    onClose: PropTypes.func,
};

Notification.defaultProps = {
    message: '',
    type: 'info',
    onClose: () => {},
};
