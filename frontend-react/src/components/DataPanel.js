import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../apiConfig';

const DataPanel = ({ refreshTrigger }) => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    const log = useCallback((...args) => {
        if (typeof console !== 'undefined') console.debug('[DataPanel]', ...args);
    }, []);

    

    const fetchTableData = useCallback(async (tableName) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/get-${tableName}`);
            if (!response.ok) {
                log('Error fetching table data:', response.status, response.statusText);
                setLoading(false);
                return;
            }

            const data = await response.json();
            setTableData(data);
        } catch (err) {
            log('Exception while fetching table data:', err);
        } finally {
            setLoading(false);
        }
    }, [log]);

    const fetchTables = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/all-tables`);
            if (!response.ok) {
                log('Error fetching tables:', response.status, response.statusText);
                return;
            }

            const data = await response.json();
            setTables(Object.keys(data));
            // If a table is already selected, refresh its data
            if (selectedTable) {
                fetchTableData(selectedTable);
            }
        } catch (err) {
            log('Exception while fetching tables:', err);
        }
    }, [selectedTable, log, fetchTableData]);

    useEffect(() => {
        fetchTables();
    }, [fetchTables, refreshTrigger]);


    const renderPlaceholder = useCallback(() => (
        <div className="placeholder-text">
            {selectedTable ? (
                <>
                    <h4>No Data Available</h4>
                    <p>No records found in {selectedTable}</p>
                </>
            ) : (
                <>
                    <h4>Select a Table</h4>
                    <p>Choose a table from the dropdown to view its data</p>
                </>
            )}
        </div>
    ), [selectedTable]);

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
            // Use a lightweight stable key if possible
            const firstKey = keys[0];
            return firstKey && row[firstKey] !== undefined ? `${firstKey}-${row[firstKey]}` : JSON.stringify(row);
        } catch (error) {
            log('Error generating row key:', error);
            return `row-${index}`;
        }
    };

    const headers = useMemo(() => (tableData[0] ? Object.keys(tableData[0]) : []), [tableData]);

    const tableContent = (() => {
        if (loading) {
            return (
                <div className="placeholder-content">
                    <div className="loading-spinner"></div>
                </div>
            );
        }

        if (selectedTable && tableData.length > 0) {
            return (
                <table className="data-table">
                    <thead>
                        <tr>
                            {headers.map(key => (
                                <th key={key}>{key.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((row, index) => {
                            const rowKey = getRowKey(row, index);
                            return (
                                <tr key={rowKey}>
                                    {headers.map((key, i) => (
                                        <td key={`${rowKey}-${i}`}>{row[key]}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="placeholder-content">
                {renderPlaceholder()}
            </div>
        );
    })();

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
                    {tableContent}
                </div>
            </div>
        </div>
    );
};

export default DataPanel;

DataPanel.propTypes = {
    refreshTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
};
