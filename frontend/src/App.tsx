import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Setting {
  uid: string;
  data: any;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

function App() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createJson, setCreateJson] = useState('{\n  "example": "value"\n}');
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editJson, setEditJson] = useState('');

  const API_BASE = '/api';

  const fetchSettings = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/settings?page=${page}&limit=10`);
      setSettings(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCreate = async () => {
    try {
      const data = JSON.parse(createJson);
      await axios.post(`${API_BASE}/settings`, data);
      setCreateJson('{\n  "example": "value"\n}');
      setShowCreateForm(false);
      fetchSettings(pagination.page);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        alert('Invalid JSON format');
      } else {
        alert('Failed to create setting');
      }
      console.error(err);
    }
  };

  const handleUpdate = async (uid: string) => {
    try {
      const data = JSON.parse(editJson);
      await axios.put(`${API_BASE}/settings/${uid}`, data);
      setEditingUid(null);
      setEditJson('');
      fetchSettings(pagination.page);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        alert('Invalid JSON format');
      } else {
        alert('Failed to update setting');
      }
      console.error(err);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this setting?')) return;
    
    try {
      await axios.delete(`${API_BASE}/settings/${uid}`);
      fetchSettings(pagination.page);
    } catch (err) {
      alert('Failed to delete setting');
      console.error(err);
    }
  };

  const startEdit = (setting: Setting) => {
    setEditingUid(setting.uid);
    setEditJson(JSON.stringify(setting.data, null, 2));
  };

  const cancelEdit = () => {
    setEditingUid(null);
    setEditJson('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Settings Management System</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ New Setting'}
        </button>
      </header>

      {showCreateForm && (
        <div className="create-form">
          <h2>Create New Setting</h2>
          <textarea
            className="json-input"
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
            rows={10}
            placeholder="Enter JSON data..."
          />
          <button className="btn btn-primary" onClick={handleCreate}>
            Create
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      <div className="settings-list">
        {settings.length === 0 && !loading && (
          <div className="empty-state">
            No settings found. Create your first one!
          </div>
        )}

        {settings.map((setting) => (
          <div key={setting.uid} className="setting-card">
            <div className="setting-header">
              <div className="setting-uid">
                <strong>UID:</strong> {setting.uid}
              </div>
              <div className="setting-actions">
                {editingUid !== setting.uid && (
                  <>
                    <button 
                      className="btn btn-small"
                      onClick={() => startEdit(setting)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(setting.uid)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {editingUid === setting.uid ? (
              <div className="edit-form">
                <textarea
                  className="json-input"
                  value={editJson}
                  onChange={(e) => setEditJson(e.target.value)}
                  rows={10}
                />
                <div className="edit-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleUpdate(setting.uid)}
                  >
                    Save
                  </button>
                  <button 
                    className="btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <pre className="setting-data">
                {JSON.stringify(setting.data, null, 2)}
              </pre>
            )}
            <div className="setting-meta">
              <span>Created: {new Date(setting.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(setting.updated_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {pagination.total_pages > 1 && (
        <div className="pagination">
          <button 
            className="btn"
            onClick={() => fetchSettings(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button 
            className="btn"
            onClick={() => fetchSettings(pagination.page + 1)}
            disabled={pagination.page === pagination.total_pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;