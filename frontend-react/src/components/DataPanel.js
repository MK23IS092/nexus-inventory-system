import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const DataPanel = ({ refreshTrigger }) => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTables();
    }, [refreshTrigger]);

    const fetchTables = async () => {
        try {
            const response = await fetch('http://localhost:5000/all-tables');
            const data = await response.json();
            setTables(Object.keys(data));
            // If a table is already selected, refresh its data
            if (selectedTable) {
                fetchTableData(selectedTable);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const fetchTableData = async (tableName) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/get-${tableName}`);
            const data = await response.json();
            setTableData(data);
        } catch (error) {
            console.error('Error fetching table data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (e) => {
        const tableName = e.target.value;
        setSelectedTable(tableName);
        if (tableName) {
            fetchTableData(tableName);
        } else {
            setTableData([]);
        }
    };

    const getRowKey = (row, index) => {
        if (!row || typeof row !== 'object') return `row-${index}`;
        const keys = Object.keys(row);
        const idKey = keys.find(k => k === 'id' || k.endsWith('_id'));
        if (idKey && row[idKey] !== undefined) return `${idKey}-${row[idKey]}`;
        try {
            return JSON.stringify(row);
        } catch (e) {
            return `row-${index}`;
        }
    };

    return (
        <div className="data-panel">
            <div className="panel-header">
                <h3>DATA MATRIX</h3>
                <div className="table-selector">
                    <select
                        id="tableSelect"
                        className="futuristic-select"
                        value={selectedTable}
                        onChange={handleTableChange}
                    >
                        <option value="">Select Table...</option>
                        {tables.map(table => (
                            <option key={table} value={table}>{table}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="table-wrapper">
                <div id="table-container" className="table-container">
                        {loading ? (
                        <div className="placeholder-content">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : selectedTable && tableData.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {Object.keys(tableData[0]).map(key => (
                                        <th key={key}>{key.toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, index) => {
                                    const rowKey = getRowKey(row, index);
                                    return (
                                        <tr key={rowKey}>
                                            {Object.values(row).map((val, i) => (
                                                <td key={`${rowKey}-${i}`}>{val}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="placeholder-content">
                            {selectedTable ? (
                                <div className="placeholder-text">
                                    <h4>No Data Available</h4>
                                    <p>No records found in {selectedTable}</p>
                                </div>
                            ) : (
                                <div className="placeholder-text">
                                    <h4>Select a Table</h4>
                                    <p>Choose a table from the dropdown to view its data</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataPanel;

DataPanel.propTypes = {
    refreshTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
};
