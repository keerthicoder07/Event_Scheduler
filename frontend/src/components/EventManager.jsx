import { useState, useEffect } from 'react';
import api from '../api';

function EventManager() {
    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [newEvent, setNewEvent] = useState({
        title: '',
        start_time: '',
        end_time: '',
        description: ''
    });

    const [error, setError] = useState('');
    const [allocationError, setAllocationError] = useState({}); // Keyed by event_id

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, resourcesRes, allocRes] = await Promise.all([
                api.get('/events'),
                api.get('/resources'),
                api.get('/allocations')
            ]);
            setEvents(eventsRes.data);
            setResources(resourcesRes.data);
            setAllocations(allocRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createEvent = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/events', newEvent);
            // Reset form and refresh
            setNewEvent({ title: '', start_time: '', end_time: '', description: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event');
        }
    };

    const allocateResource = async (eventId, resourceId) => {
        setAllocationError(prev => ({ ...prev, [eventId]: '' }));
        if (!resourceId) return;

        try {
            await api.post('/allocations', {
                event_id: eventId,
                resource_id: resourceId
            });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Allocation failed';
            setAllocationError(prev => ({ ...prev, [eventId]: msg }));
        }
    };

    // Helper to get allocations for an event
    const getEventAllocations = (eventId) => {
        return allocations.filter(a => a.event_id === eventId);
    };

    return (
        <div>
            <div className="card">
                <h3>Create Event</h3>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={createEvent}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            className="form-input"
                            value={newEvent.title}
                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={newEvent.start_time}
                                onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>End Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={newEvent.end_time}
                                onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-input"
                            value={newEvent.description}
                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Create Event</button>
                </form>
            </div>

            <div className="card">
                <h3>Events</h3>
                {events.length === 0 ? <p className="text-subtle">No events scheduled.</p> : (
                    <div className="flex-col">
                        {events.map(event => (
                            <div key={event.event_id} style={{ border: '1px solid var(--border-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex-row justify-between items-center" style={{ alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 className="mb-0">{event.title}</h4>
                                        <p className="text-subtle mt-2">
                                            {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
                                        </p>
                                        <p className="mt-2">{event.description}</p>
                                    </div>
                                </div>

                                <div className="mt-4" style={{ paddingTop: '1rem', borderTop: '1px dashed var(--border-light)' }}>
                                    <h5 className="text-subtle" style={{ fontSize: '0.85rem' }}>ALLOCATED RESOURCES</h5>
                                    <div className="flex-row gap-2" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {getEventAllocations(event.event_id).map(a => (
                                            <span key={a.allocation_id} className="badge badge-blue">
                                                {a.resource_name}
                                            </span>
                                        ))}
                                        {getEventAllocations(event.event_id).length === 0 && <span className="text-subtle" style={{ fontStyle: 'italic' }}>None</span>}
                                    </div>

                                    <div className="flex-row">
                                        <select
                                            className="form-select"
                                            style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 1rem' }}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    allocateResource(event.event_id, e.target.value);
                                                    e.target.value = ''; // Reset
                                                }
                                            }}
                                        >
                                            <option value="">+ Allocate Resource</option>
                                            {resources.map(r => (
                                                <option key={r.resource_id} value={r.resource_id}>
                                                    {r.resource_name} ({r.resource_type})
                                                </option>
                                            ))}
                                        </select>
                                        {allocationError[event.event_id] && (
                                            <span className="text-error">{allocationError[event.event_id]}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventManager;
