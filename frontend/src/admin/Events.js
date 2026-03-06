import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './admin.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: iconMarker, shadowUrl: iconShadow });

const EVENT_TYPES = ['Seminar', 'Sports', 'Cultural', 'Workshop', 'Exam', 'Meeting', 'Conference', 'Other'];

const EVENT_COLORS = {
  Seminar: '#3b82f6', Sports: '#22c55e', Cultural: '#f59e0b',
  Workshop: '#8b5cf6', Exam: '#ef4444', Meeting: '#06b6d4',
  Conference: '#ec4899', Other: '#64748b',
};

const EVENT_ICONS = {
  Seminar: '🎓', Sports: '⚽', Cultural: '🎭', Workshop: '🛠️',
  Exam: '📝', Meeting: '🤝', Conference: '🎤', Other: '📅',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Map click handler
function LocationPicker({ position, setPosition }) {
  useMapEvents({ click: (e) => setPosition(e.latlng) });
  return position ? (
    <Marker position={position} draggable eventHandlers={{ dragend: e => setPosition(e.target.getLatLng()) }}>
      <Popup>Event Venue</Popup>
    </Marker>
  ) : null;
}

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Added for edit mode
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [position, setPosition] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', eventType: 'Seminar',
    date: '', time: '', locationName: '',
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleOpenModal = (eventToEdit = null) => {
    if (eventToEdit) {
      setEditingId(eventToEdit._id);
      setFormData({
        title: eventToEdit.title,
        description: eventToEdit.description,
        eventType: eventToEdit.eventType || 'Other',
        date: eventToEdit.date ? new Date(eventToEdit.date).toISOString().split('T')[0] : '',
        time: eventToEdit.time || '',
        locationName: eventToEdit.locationName
      });
      setPosition({ lat: eventToEdit.coordinates.lat, lng: eventToEdit.coordinates.lng });
    } else {
      setEditingId(null);
      setPosition(null);
      setFormData({ title: '', description: '', eventType: 'Seminar', date: '', time: '', locationName: '' });
    }
    setSaveMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) { setSaveMsg({ type: 'error', text: 'Please click on the map to pin the event venue.' }); return; }
    setSaving(true); setSaveMsg(null);
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingId ? `${API_URL}/api/events/${editingId}` : `${API_URL}/api/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, coordinates: { lat: position.lat, lng: position.lng } }),
      });
      if (res.ok) {
        setSaveMsg({ type: 'success', text: `Event ${editingId ? 'updated' : 'created'} successfully!` });
        await fetchEvents();
        setTimeout(() => { setShowModal(false); setSaveMsg(null); setEditingId(null); }, 1200);
      } else { setSaveMsg({ type: 'error', text: `Failed to ${editingId ? 'update' : 'create'} event. Try again.` }); }
    } catch { setSaveMsg({ type: 'error', text: 'Server error.' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await fetch(`${API_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });
    setEvents(events.filter(e => e._id !== id));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Manage Events
            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 400, marginLeft: '10px' }}>
              ({events.length} total)
            </span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Events appear on the campus map and user Events page</p>
        </div>
        <button className="create-btn" onClick={() => handleOpenModal()}>+ Add New Event</button>
      </div>

      {/* Table */}
      <div className="admin-table-container fade-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>⏳ Loading events...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No events yet. Click "+ Add New Event" to create one.</td></tr>
            ) : events.map(ev => (
              <tr key={ev._id}>
                <td data-label="Event" style={{ fontWeight: 600 }}>
                  {EVENT_ICONS[ev.eventType] || '📅'} {ev.title}
                </td>
                <td data-label="Type">
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: `${EVENT_COLORS[ev.eventType] || '#64748b'}20`,
                    color: EVENT_COLORS[ev.eventType] || '#64748b',
                    border: `1px solid ${EVENT_COLORS[ev.eventType] || '#64748b'}40`,
                  }}>
                    {ev.eventType || 'Other'}
                  </span>
                </td>
                <td data-label="Date" style={{ fontSize: '0.85rem', color: '#475569' }}>
                  {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ''}
                </td>
                <td data-label="Venue" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  📍 {ev.locationName}
                </td>
                <td data-label="Actions" style={{ gap: '8px', display: 'flex' }}>
                  <button className="action-btn edit-btn" onClick={() => handleOpenModal(ev)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569' }}>Edit</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(ev._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="admin-modal" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="location-picker-modal">

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingId ? '✏️ Edit Event' : '🎉 Add New Event'}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Fill in the details and click the campus map to pin the event venue.
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            {/* Two-column layout */}
            <div className="location-picker-grid">

              {/* Left: Form */}
              <form onSubmit={handleSubmit} className="location-picker-form">

                <div className="admin-input-group">
                  <label>Event Title *</label>
                  <input type="text" placeholder="e.g. Annual Sports Day" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-input-group">
                    <label>Event Type *</label>
                    <select value={formData.eventType} onChange={e => setFormData({ ...formData, eventType: e.target.value })} required>
                      {EVENT_TYPES.map(t => (
                        <option key={t} value={t}>{EVENT_ICONS[t]} {t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-input-group">
                    <label>Date *</label>
                    <input type="date" value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="admin-input-group">
                    <label>Time</label>
                    <input type="time" value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })} />
                  </div>
                  <div className="admin-input-group">
                    <label>Venue Name *</label>
                    <input type="text" placeholder="e.g. Main Ground"
                      value={formData.locationName}
                      onChange={e => setFormData({ ...formData, locationName: e.target.value })} required />
                  </div>
                </div>

                <div className="admin-input-group">
                  <label>Description *</label>
                  <textarea placeholder="Describe the event..." value={formData.description} rows={3}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ resize: 'vertical' }} required />
                </div>

                {/* Pin status */}
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: position ? 'rgba(16,185,129,0.08)' : 'rgba(241,245,249,0.8)',
                  border: `1px solid ${position ? 'rgba(16,185,129,0.3)' : '#e2e8f0'}`,
                  fontSize: '0.82rem', color: position ? '#059669' : '#94a3b8',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span>{position ? '✅' : '🖱️'}</span>
                  {position ? `Venue: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : 'Click map to pin venue location'}
                </div>

                {saveMsg && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem',
                    background: saveMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${saveMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: saveMsg.type === 'success' ? '#059669' : '#dc2626',
                  }}>
                    {saveMsg.text}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="submit" className="admin-btn" disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : '💾 Save Event'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}>
                    Cancel
                  </button>
                </div>
              </form>

              {/* Right: Map */}
              <div className="location-picker-map-wrapper">
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textAlign: 'right' }}>
                  🗺️ Satellite view · Click to pin venue · Drag pin to adjust
                </div>
                <div className="location-picker-map">
                  <MapContainer center={[23.133261, 77.563809]} zoom={17} minZoom={16} maxZoom={18}
                    maxBounds={[[23.130194, 77.561124], [23.136328, 77.566493]]}
                    maxBoundsViscosity={1.0}
                    style={{ height: '100%', width: '100%', borderRadius: '10px' }}>
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="RNTU Campus" maxZoom={20} />
                    <LocationPicker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
