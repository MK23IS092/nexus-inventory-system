import React, { useState, useEffect } from 'react';
import { TABLES } from '../../constants';
import PropTypes from 'prop-types';

const emptyRow = () => ({ table: '', id: '', attributes: {} });

const ModifyItemModal = ({ isOpen, onClose, onConfirm }) => {
    const [rowCount, setRowCount] = useState(1);
    const [rows, setRows] = useState([emptyRow()]);

    useEffect(() => {
        if (!isOpen) {
            setRowCount(1);
            setRows([emptyRow()]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const count = Number.parseInt(rowCount, 10) || 1;
        setRows((prev) => {
            if (count === prev.length) return prev;
            if (count > prev.length) {
                return [...prev, ...Array.from({ length: count - prev.length }, emptyRow)];
            }
            return prev.slice(0, count);
        });
    }, [isOpen, rowCount]);

    const handleRowChange = (index, field, value) => {
        setRows((prev) => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            if (field === 'table') {
                newRows[index].attributes = {};
            }
            return newRows;
        });
    };

    const handleAttributeValueChange = (rowIndex, attrName, value) => {
        setRows((prev) => {
            const newRows = [...prev];
            const attributes = { ...newRows[rowIndex].attributes };
            if (value === '' || value === null || value === undefined) {
                delete attributes[attrName];
            } else {
                attributes[attrName] = value;
            }
            newRows[rowIndex] = { ...newRows[rowIndex], attributes };
            return newRows;
        });
    };

    const handleRemoveRow = (index) => {
        setRows((prev) => {
            const newRows = prev.filter((_, i) => i !== index);
            setRowCount(Math.max(1, newRows.length));
            return newRows.length ? newRows : [emptyRow()];
        });
    };

    const handleConfirm = () => {
        const payload = rows
            .map((row) => ({
                table: row.table?.trim(),
                id: String(row.id ?? '').trim(),
                attributes: Object.fromEntries(
                    Object.entries(row.attributes || {}).filter(
                        ([, value]) => value !== '' && value !== null && value !== undefined
                    )
                ),
            }))
            .filter((row) => row.table && row.id && Object.keys(row.attributes).length > 0);

        if (payload.length === 0) {
            return;
        }

        onConfirm(payload);
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
                                                {attr.type === 'boolean' ? (
                                                    <select
                                                        className="futuristic-select"
                                                        value={row.attributes[attr.name] ?? ''}
                                                        onChange={(e) => handleAttributeValueChange(index, attr.name, e.target.value)}
                                                    >
                                                        <option value="">Leave unchanged</option>
                                                        <option value="true">True</option>
                                                        <option value="false">False</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={getInputType(attr.type)}
                                                        className="futuristic-input"
                                                        placeholder={`New ${attr.name}`}
                                                        value={row.attributes[attr.name] ?? ''}
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
