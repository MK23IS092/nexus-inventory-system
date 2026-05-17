import React, { useState, useEffect } from 'react';
import { TABLES } from '../../constants';
import PropTypes from 'prop-types';

const AddItemModal = ({ isOpen, onClose, onConfirm }) => {
    const [selectedTable, setSelectedTable] = useState('');
    const [rowCount, setRowCount] = useState(1);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setRows(new Array(Number.parseInt(rowCount) || 1).fill({}));
        } else {
            setSelectedTable('');
            setRowCount(1);
            setRows([]);
        }
    }, [isOpen]);

    useEffect(() => {
        setRows(new Array(Number.parseInt(rowCount) || 1).fill({}));
    }, [rowCount]);

    const handleInputChange = (rowIndex, field, value) => {
        const newRows = [...rows];
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
        setRows(newRows);
    };

    const handleConfirm = () => {
        if (!selectedTable) return;
        onConfirm(selectedTable, rows);
    };

    if (!isOpen) return null;

    const tableSchema = TABLES.find(t => t.name === selectedTable);

    return (
        <div className={`modal ${isOpen ? 'active' : ''}`} id="addItemModal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>ADD NEW ITEM</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="addItemTableSelect">SELECT TABLE</label>
                        <select
                            id="addItemTableSelect"
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
                        <label htmlFor="rowCount">NUMBER OF ROWS</label>
                        <input
                            type="number"
                            id="rowCount"
                            className="futuristic-input"
                            min="1"
                            value={rowCount}
                            onChange={(e) => setRowCount(e.target.value)}
                        />
                    </div>

                    <div id="rowsContainer" className="rows-container">
                        {selectedTable && rows.map((_, index) => (
                            <div key={`${selectedTable}-${index}`} className="row-group">
                                <div className="row-header">
                                    <div className="row-title">Row {index + 1}</div>
                                </div>
                                <div className="row-content">
                                    {tableSchema.attributes.map(attr => (
                                        <div key={attr.name} className="attribute-field">
                                            <label className="attribute-label">{attr.name}</label>
                                            {attr.type === 'boolean' ? (
                                                <select
                                                    className="futuristic-select"
                                                    onChange={(e) => handleInputChange(index, attr.name, e.target.value === 'true')}
                                                >
                                                    <option value="true">True</option>
                                                    <option value="false">False</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type={attr.type === 'int' || attr.type === 'decimal' ? 'number' : attr.type === 'datetime' ? 'datetime-local' : 'text'}
                                                    className="futuristic-input"
                                                    placeholder={attr.isForeign ? `Select ${attr.references} ID` : attr.isPrimary ? `Enter ${attr.name} (Required)` : `Enter ${attr.name}`}
                                                    step={attr.type === 'decimal' ? '0.01' : undefined}
                                                    onChange={(e) => handleInputChange(index, attr.name, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {!selectedTable && <div className="no-table-selected">Please select a table first</div>}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>CANCEL</button>
                    <button className="btn btn-primary" onClick={handleConfirm}>CONFIRM</button>
                </div>
            </div>
        </div>
    );
};

export default AddItemModal;

AddItemModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func.isRequired,
};

AddItemModal.defaultProps = {
    isOpen: false,
    onClose: () => {},
};
