import React, { useState, useEffect } from 'react';
import { TABLES } from '../../constants';
import PropTypes from 'prop-types';

const DeleteItemModal = ({ isOpen, onClose, onConfirm }) => {
    const [selectedTable, setSelectedTable] = useState('');
    const [rowCount, setRowCount] = useState(1);
    const [ids, setIds] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setIds(new Array(Number.parseInt(rowCount) || 1).fill(''));
        } else {
            setSelectedTable('');
            setRowCount(1);
            setIds([]);
        }
    }, [isOpen, rowCount]);

    useEffect(() => {
        setIds(prev => {
            const newCount = Number.parseInt(rowCount) || 1;
            const newIds = [...prev];
            if (newCount > prev.length) {
                for (let i = prev.length; i < newCount; i++) {
                    newIds.push('');
                }
            } else {
                newIds.length = newCount;
            }
            return newIds;
        });
    }, [rowCount]);

    const handleIdChange = (index, value) => {
        const newIds = [...ids];
        newIds[index] = value;
        setIds(newIds);
    };

    const handleConfirm = () => {
        if (!selectedTable) return;
        onConfirm(selectedTable, ids.filter(id => id.trim() !== ''));
    };

    if (!isOpen) return null;

    const tableSchema = TABLES.find(t => t.name === selectedTable);
    const primaryKey = tableSchema ? tableSchema.attributes.find(attr => attr.isPrimary) : null;

    return (
        <div className={`modal ${isOpen ? 'active' : ''}`} id="deleteItemModal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>DELETE ITEMS</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="deleteTableSelect">SELECT TABLE</label>
                        <select
                            id="deleteTableSelect"
                            className="futuristic-select"
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                        >
                            <option value="">Choose a table...</option>
                            {TABLES.map(t => (
                                <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="deleteRowCount">NUMBER OF ROWS TO DELETE</label>
                        <input
                            type="number"
                            id="deleteRowCount"
                            className="futuristic-input"
                            min="1"
                            value={rowCount}
                            onChange={(e) => setRowCount(e.target.value)}
                        />
                    </div>

                    <div id="deleteRowsContainer" className="rows-container">
                        {selectedTable && primaryKey && ids.map((id, index) => (
                            <div key={`${selectedTable}-${index}`} className="row-group">
                                <div className="form-group">
                                    <label>{primaryKey.name.toUpperCase()} TO DELETE</label>
                                    <input
                                        type="text"
                                        className="futuristic-input"
                                        placeholder={`Enter ${primaryKey.name}`}
                                        value={id}
                                        onChange={(e) => handleIdChange(index, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>CANCEL</button>
                    <button className="btn btn-primary" onClick={handleConfirm}>DELETE</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteItemModal;

DeleteItemModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func.isRequired,
};

DeleteItemModal.defaultProps = {
    isOpen: false,
    onClose: () => {},
};
