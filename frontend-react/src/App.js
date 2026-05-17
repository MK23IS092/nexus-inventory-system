import React, { useState } from 'react';
import './App.css';
import StatusBar from './components/StatusBar';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import DataPanel from './components/DataPanel';
import AddItemModal from './components/modals/AddItemModal';
import ModifyItemModal from './components/modals/ModifyItemModal';
import DeleteItemModal from './components/modals/DeleteItemModal';
import Notification from './components/Notification';
import { API_BASE_URL } from './apiConfig';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddConfirm = async (table, rows) => {
    let successCount = 0;
    let errorCount = 0;

    showNotification(`Attempting to add ${rows.length} item(s) to ${table}...`, 'info');

    for (const row of rows) {
      try {
        const response = await fetch(`${API_BASE_URL}/add-${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error adding item:', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      showNotification(`${successCount} item(s) added successfully to ${table}!`, 'success');
      setActiveModal(null);
      setRefreshTrigger(prev => prev + 1);
    }
    if (errorCount > 0) {
      showNotification(`${errorCount} item(s) failed to add. Check console.`, 'error');
    }
  };

  const handleModifyConfirm = async (rows) => {
    let successCount = 0;
    let failedCount = 0;

    showNotification(`Attempting to modify ${rows.length} item(s)...`, 'info');

    for (const row of rows) {
      if (!row.table || !row.id || Object.keys(row.attributes).length === 0) {
        failedCount++;
        continue;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/update-row`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table_name: row.table,
            key: row.id,
            attribute_list: row.attributes
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error('Error modifying item:', error);
        failedCount++;
      }
    }

    if (successCount > 0) {
      showNotification(`${successCount} item(s) updated successfully.`, 'success');
      setActiveModal(null);
      setRefreshTrigger(prev => prev + 1);
    }
    if (failedCount > 0) {
      showNotification(`${failedCount} item(s) failed to update.`, 'error');
    }
  };

  const handleDeleteConfirm = async (table, ids) => {
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    showNotification(`Attempting to delete ${ids.length} item(s) from ${table}...`, 'info');

    for (const id of ids) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete-${table}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          successCount++;
        } else if (response.status === 404) {
          notFoundCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      showNotification(`${successCount} item(s) deleted successfully!`, 'success');
      setActiveModal(null);
      setRefreshTrigger(prev => prev + 1);
    }
    if (notFoundCount > 0) {
      showNotification(`${notFoundCount} item(s) not found.`, 'warning');
    }
    if (errorCount > 0) {
      showNotification(`${errorCount} item(s) failed to delete.`, 'error');
    }
  };

  return (
    <div className="App">
      <div className="bg-grid"></div>
      <div className="bg-noise"></div>

      <StatusBar />

      <div className="container">
        <Header />
        <ControlPanel onAction={setActiveModal} />
        <DataPanel refreshTrigger={refreshTrigger} />

        <footer className="footer">
          <div className="footer-content">
            <span>© 2025 Nexus Systems</span>
            <span className="separator">|</span>
            <span>Secure Inventory Protocol</span>
            <span className="separator">|</span>
            <span>Enterprise Edition</span>
          </div>
        </footer>
      </div>

      <AddItemModal
        isOpen={activeModal === 'add'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleAddConfirm}
      />

      <ModifyItemModal
        isOpen={activeModal === 'modify'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleModifyConfirm}
      />

      <DeleteItemModal
        isOpen={activeModal === 'remove'}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDeleteConfirm}
      />

      <div className="notification-container">
        {notifications.map(n => (
          <Notification
            key={n.id}
            message={n.message}
            type={n.type}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
