import React, { useState, useEffect } from 'react';

const StatusBar = () => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="status-bar">
            <div className="status-item">
                <span className="status-dot"></span>
                <span>System Online</span>
            </div>
            <div className="status-item">
                <span>v2.4.1</span>
            </div>
            <div className="status-item">
                <span id="current-time">{time}</span>
            </div>
        </div>
    );
};

export default StatusBar;
