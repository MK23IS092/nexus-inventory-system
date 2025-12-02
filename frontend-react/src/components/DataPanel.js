import React, { useState, useEffect } from 'react';

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
                                {tableData.map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((val, i) => (
                                            <td key={i}>{val}</td>
                                        ))}
                                    </tr>
                                ))}
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
