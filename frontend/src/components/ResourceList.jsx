import { useState, useEffect } from 'react';
import api from '../api';

function ResourceList() {
    const [resources, setResources] = useState([]);
    const [newResource, setNewResource] = useState({ resource_name: '', resource_type: 'room' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await api.get('/resources');
            setResources(res.data);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newResource.resource_name) return;

        setLoading(true);
        try {
            await api.post('/resources', newResource);
            fetchResources();
            setNewResource({ resource_name: '', resource_type: 'room' });
        } catch (err) {
            alert("Failed to create resource");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="card">
                <h3>Add New Resource</h3>
                <form onSubmit={handleSubmit} className="flex-row" style={{ alignItems: 'flex-end' }}>
                    <div className="form-group mb-0" style={{ flex: 1 }}>
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newResource.resource_name}
                            onChange={(e) => setNewResource({ ...newResource, resource_name: e.target.value })}
                            placeholder="e.g. Conference Room A"
                        />
                    </div>
                    <div className="form-group mb-0" style={{ width: '200px' }}>
                        <label>Type</label>
                        <select
                            className="form-select"
                            value={newResource.resource_type}
                            onChange={(e) => setNewResource({ ...newResource, resource_type: e.target.value })}
                        >
                            <option value="room">Room</option>
                            <option value="instructor">Instructor</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        Add Resource
                    </button>
                </form>
            </div>

            <div className="card">
                <h3>Existing Resources</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(r => (
                                <tr key={r.resource_id}>
                                    <td>{r.resource_id}</td>
                                    <td>{r.resource_name}</td>
                                    <td>
                                        <span className="badge badge-gray">{r.resource_type}</span>
                                    </td>
                                </tr>
                            ))}
                            {resources.length === 0 && (
                                <tr><td colSpan="3" className="text-subtle" style={{ textAlign: 'center' }}>No resources found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ResourceList;
