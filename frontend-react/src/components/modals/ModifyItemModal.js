import React, { useState, useEffect } from 'react';
import { TABLES } from '../../constants';
import PropTypes from 'prop-types';

const ModifyItemModal = ({ isOpen, onClose, onConfirm }) => {
    const [rowCount, setRowCount] = useState(1);
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setRows(new Array(Number.parseInt(rowCount) || 1).fill({ table: '', id: '', attributes: {} }));
        } else {
            setRowCount(1);
            setRows([]);
        }
    }, [isOpen]);

    useEffect(() => {
        // Adjust rows array size while preserving existing data
        setRows(prev => {
            const newCount = Number.parseInt(rowCount) || 1;
            const newRows = [...prev];
            if (newCount > prev.length) {
                for (let i = prev.length; i < newCount; i++) {
                    newRows.push({ table: '', id: '', attributes: {} });
                }
            } else {
                newRows.length = newCount;
            }
            return newRows;
        });
    }, [rowCount]);

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        // Reset attributes if table changes
        if (field === 'table') {
            newRows[index].attributes = {};
        }
        setRows(newRows);
    };

    const handleAttributeToggle = (rowIndex, attrName, checked) => {
        const newRows = [...rows];
        const currentAttributes = { ...newRows[rowIndex].attributes };
        if (checked) {
            currentAttributes[attrName] = ''; // Initialize with empty string
        } else {
            delete currentAttributes[attrName];
        }
        newRows[rowIndex].attributes = currentAttributes;
        setRows(newRows);
    };

    const handleAttributeValueChange = (rowIndex, attrName, value) => {
        const newRows = [...rows];
        newRows[rowIndex].attributes = {
            ...newRows[rowIndex].attributes,
            [attrName]: value
        };
        setRows(newRows);
    };

    const handleRemoveRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        setRowCount(newRows.length);
    };

    const handleConfirm = () => {
        // Transform rows to the format expected by backend
        // Backend expects: { table_name, key, attribute_list }
        // But the parent component will handle the API call loop.
        // We just pass the raw data.
        onConfirm(rows);
    };

    const getInputType = (attrType) => {
        if (attrType === 'int' || attrType === 'decimal') return 'number';
        if (attrType === 'datetime') return 'datetime-local';
        return 'text';
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? 'active' : ''}`} id="modifyItemModal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>MODIFY ITEMS</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="modifyRowCount">NUMBER OF ROWS TO MODIFY</label>
                        <input
                            type="number"
                            id="modifyRowCount"
                            className="futuristic-input"
                            min="1"
                            value={rowCount}
                            onChange={(e) => setRowCount(e.target.value)}
                        />
                    </div>

                    <div id="modifyRowsContainer" className="rows-container">
                        {rows.map((row, index) => (
                            <div key={`modify-${row.table || 'row'}-${index}`} className="row-group">
                                <div className="row-header">
                                    <div className="row-title">Row {index + 1}</div>
                                    <button className="remove-row" onClick={() => handleRemoveRow(index)}>×</button>
                                </div>
                                <div className="table-id-group">
                                    <select
                                        className="futuristic-select"
                                        value={row.table}
                                        onChange={(e) => handleRowChange(index, 'table', e.target.value)}
                                    >
                                        <option value="">Select Table</option>
                                        {TABLES.map(t => (
                                            <option key={t.name} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        className="futuristic-input"
                                        placeholder="Enter ID to modify"
                                        value={row.id}
                                        onChange={(e) => handleRowChange(index, 'id', e.target.value)}
                                    />
                                </div>
                                <div className="attributes-container">
                                    {row.table && TABLES.find(t => t.name === row.table).attributes
                                        .filter(attr => !attr.isPrimary)
                                        .map(attr => (
                                            <div key={attr.name} className="attribute-field">
                                                <label className="attribute-label">{attr.name}</label>
                                                <input
                                                    type="checkbox"
                                                    className="modify-checkbox"
                                                    checked={row.attributes.hasOwnProperty(attr.name)}
                                                    onChange={(e) => handleAttributeToggle(index, attr.name, e.target.checked)}
                                                />
                                                {attr.type === 'boolean' ? (
                                                    <select
                                                        className="futuristic-select"
                                                        disabled={!row.attributes.hasOwnProperty(attr.name)}
                                                        value={row.attributes[attr.name] || ''}
                                                        onChange={(e) => handleAttributeValueChange(index, attr.name, e.target.value)}
                                                    >
                                                        <option value="">Select...</option>
                                                        <option value="true">True</option>
                                                        <option value="false">False</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={getInputType(attr.type)}
                                                        className="futuristic-input"
                                                        placeholder="Enter value"
                                                        disabled={!row.attributes.hasOwnProperty(attr.name)}
                                                        value={row.attributes[attr.name] || ''}
                                                        onChange={(e) => handleAttributeValueChange(index, attr.name, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        ))}
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

export default ModifyItemModal;

ModifyItemModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func.isRequired,
};

ModifyItemModal.defaultProps = {
    isOpen: false,
    onClose: () => {},
};
