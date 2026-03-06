import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './admin.css';

// Campus center & hardcoded buildings (for map display in picker)
const CAMPUS_CENTER = [23.1332, 77.5638];

const BUILDINGS_TO_SEED = [
  { name: "Gate 1", lat: 23.1353284, lng: 77.5621247, type: "entrance" },
  { name: "Gate 2", lat: 23.1350571, lng: 77.5638681, type: "entrance" },
  { name: "Gate 3", lat: 23.1351952, lng: 77.5652253, type: "entrance" },
  { name: "Football Ground", lat: 23.1346772, lng: 77.5629937, type: "sports" },
  { name: "Parking", lat: 23.1347712, lng: 77.5640677, type: "parking" },
  { name: "Boys Hostel", lat: 23.1347265, lng: 77.5654935, type: "hostel" },
  { name: "Admission Cell", lat: 23.1344207, lng: 77.5628703, type: "admin" },
  { name: "Admin", lat: 23.1343418, lng: 77.5643509, type: "admin" },
  { name: "Engineering", lat: 23.1342135, lng: 77.5636482, type: "academic" },
  { name: "AIC", lat: 23.1338929, lng: 77.5647962, type: "facility" },
  { name: "Paramedical", lat: 23.1337597, lng: 77.5628435, type: "facility" },
  { name: "Management", lat: 23.1335179, lng: 77.5642812, type: "admin" },
  { name: "Workshops", lat: 23.1333995, lng: 77.5624895, type: "facility" },
  { name: "Audi & Law", lat: 23.1332318, lng: 77.5649571, type: "facility" },
  { name: "DSW", lat: 23.1330493, lng: 77.5637072, type: "facility" },
  { name: "Canteen", lat: 23.1330888, lng: 77.5630903, type: "facility" },
  { name: "Library", lat: 23.1324524, lng: 77.5647747, type: "library" },
  { name: "Basketball Court", lat: 23.1321761, lng: 77.5642114, type: "sports" },
  { name: "Science", lat: 23.1319837, lng: 77.5649464, type: "academic" },
  { name: "Agriculture", lat: 23.1317174, lng: 77.5645548, type: "academic" },
  { name: "Pharmacy", lat: 23.1316779, lng: 77.5648927, type: "academic" },
  { name: "Main Ground", lat: 23.1317124, lng: 77.5631010, type: "sports" },
  { name: "TNSD", lat: 23.1311944, lng: 77.5625753, type: "academic" },
  { name: "Girls Hostel", lat: 23.134105, lng: 77.565460, type: "hostel" },
  { name: "Food Processing Unit", lat: 23.131629, lng: 77.564082, type: "facility" }
];

const CATEGORY_ICONS = {
  academic: '🎓', admin: '🏢', facility: '🏫', hostel: '🏠',
  sports: '⚽', parking: '🅿️', entrance: '🚪', library: '📚',
};

const CATEGORY_COLORS = {
  academic: '#f59e0b', admin: '#3b82f6', facility: '#06b6d4',
  hostel: '#ec4899', sports: '#22c55e', parking: '#64748b',
  entrance: '#10b981', library: '#8b5cf6',
};

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Click handler sub-component for the picker map
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

// Create a small coloured circle icon for existing buildings
const createSmallIcon = (category) => L.divIcon({
  html: `<div style="width:10px;height:10px;border-radius:50%;background:${CATEGORY_COLORS[category] || '#94a3b8'};border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

// Red pin for the selected/new location
const newPinIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(null); // { lat, lng }
  const [formData, setFormData] = useState({
    name: '', category: 'academic', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  useEffect(() => { fetchAndAutoSeed(); }, []);

  const fetchAndAutoSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/locations`);
      const data = await res.json();
      if (Array.isArray(data) && data.length === 0) {
        const token = localStorage.getItem('adminToken');
        await Promise.all(
          BUILDINGS_TO_SEED.map(b =>
            fetch(`${API_URL}/api/locations`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                name: b.name, category: b.type,
                description: `${b.type.charAt(0).toUpperCase() + b.type.slice(1)} facility`,
                coordinates: { latitude: b.lat, longitude: b.lng }
              }),
            })
          )
        );
        const refetch = await fetch(`${API_URL}/api/locations`);
        setLocations(await refetch.json());
      } else {
        setLocations(data);
      }
    } catch (err) { console.error('Error:', err); }
    finally { setLoading(false); }
  };

  const fetchLocations = async () => {
    const res = await fetch(`${API_URL}/api/locations`);
    setLocations(await res.json());
  };

  const handleOpenModal = () => {
    setPickedCoords(null);
    setFormData({ name: '', category: 'academic', description: '' });
    setSaveMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickedCoords) { setSaveMsg({ type: 'error', text: 'Please click on the map to set the location pin.' }); return; }
    setSaving(true);
    setSaveMsg(null);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          coordinates: { latitude: pickedCoords.lat, longitude: pickedCoords.lng }
        }),
      });
      if (res.ok) {
        setSaveMsg({ type: 'success', text: 'Location saved successfully!' });
        await fetchLocations();
        setTimeout(() => { setShowModal(false); setSaveMsg(null); }, 1200);
      } else {
        setSaveMsg({ type: 'error', text: 'Failed to save. Please try again.' });
      }
    } catch (err) {
      setSaveMsg({ type: 'error', text: 'Server error.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_URL}/api/locations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLocations(locations.filter(l => l._id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Manage Locations
            <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 400, marginLeft: '10px' }}>
              ({locations.length} total)
            </span>
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Locations appear on the campus map and user search
          </p>
        </div>
{/* <button className="create-btn" onClick={handleOpenModal}>+ Add New Location</button> */}
      </div>

      {/* Table */}
      <div className="admin-table-container fade-in">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Coordinates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>⏳ Loading locations...</td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No locations found.</td></tr>
            ) : locations.map(loc => (
              <tr key={loc._id}>
                <td data-label="Name" style={{ fontWeight: 600 }}>
                  <span style={{ marginRight: '8px' }}>
                    {CATEGORY_ICONS[loc.category] || '📍'}
                  </span>
                  {loc.name}
                </td>
                <td data-label="Category">
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: `${CATEGORY_COLORS[loc.category] || '#64748b'}20`,
                    color: CATEGORY_COLORS[loc.category] || '#64748b',
                    border: `1px solid ${CATEGORY_COLORS[loc.category] || '#64748b'}40`,
                    textTransform: 'capitalize'
                  }}>
                    {loc.category}
                  </span>
                </td>
                <td data-label="Coordinates" style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {loc.coordinates?.latitude?.toFixed(5)}, {loc.coordinates?.longitude?.toFixed(5)}
                </td>
                <td data-label="Actions" style={{ display: 'flex', gap: '8px' }}>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(loc._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Location Modal — temporarily disabled */}
      {false && showModal && (
        <div className="admin-modal" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="location-picker-modal">

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>📍 Add New Location</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Click on the campus map to place your pin, then fill in the details.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >×</button>
            </div>

            {/* Two-column layout */}
            <div className="location-picker-grid">

              {/* Left: Form */}
              <form onSubmit={handleSubmit} className="location-picker-form">

                <div className="admin-input-group">
                  <label>Location Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. New Lab Block"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="academic">🎓 Academic</option>
                    <option value="admin">🏢 Administrative</option>
                    <option value="facility">🏫 Facility</option>
                    <option value="hostel">🏠 Hostel</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="parking">🅿️ Parking</option>
                    <option value="entrance">🚪 Entrance / Gate</option>
                    <option value="library">📚 Library</option>
                  </select>
                </div>

                <div className="admin-input-group">
                  <label>Description (optional)</label>
                  <textarea
                    placeholder="Brief description..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Coordinates display */}
                <div style={{
                  padding: '12px 14px', borderRadius: '8px', marginBottom: '8px',
                  background: pickedCoords ? 'rgba(16,185,129,0.08)' : 'rgba(241,245,249,0.8)',
                  border: `1px solid ${pickedCoords ? 'rgba(16,185,129,0.3)' : '#e2e8f0'}`,
                  fontSize: '0.82rem', color: pickedCoords ? '#059669' : '#94a3b8',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span>{pickedCoords ? '✅' : '🖱️'}</span>
                  {pickedCoords
                    ? `Lat: ${pickedCoords.lat.toFixed(6)}, Lng: ${pickedCoords.lng.toFixed(6)}`
                    : 'Click on the map to pick coordinates'}
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

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="admin-btn"
                    disabled={saving}
                    style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : '💾 Save Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
                      background: 'white', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Right: Map Picker */}
              <div className="location-picker-map-wrapper">
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px', textAlign: 'right' }}>
                  🗺️ Satellite view · Click to drop pin · Grey dots = existing locations
                </div>
                <div className="location-picker-map">
                  <MapContainer
                    center={CAMPUS_CENTER}
                    zoom={17}
                    style={{ height: '100%', width: '100%', borderRadius: '10px' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="RNTU Campus"
                      maxZoom={20}
                    />

                    {/* Click handler */}
                    <MapClickHandler onMapClick={(latlng) => setPickedCoords({ lat: latlng.lat, lng: latlng.lng })} />

                    {/* Existing locations as small grey dots */}
                    {locations.map(loc => (
                      <Marker
                        key={loc._id}
                        position={[loc.coordinates.latitude, loc.coordinates.longitude]}
                        icon={createSmallIcon(loc.category)}
                      >
                        <Popup>
                          <strong>{loc.name}</strong><br />
                          <span style={{ textTransform: 'capitalize', fontSize: '11px', color: '#64748b' }}>{loc.category}</span>
                        </Popup>
                      </Marker>
                    ))}

                    {/* New pin */}
                    {pickedCoords && (
                      <Marker
                        position={[pickedCoords.lat, pickedCoords.lng]}
                        icon={newPinIcon}
                        draggable
                        eventHandlers={{
                          dragend: (e) => {
                            const { lat, lng } = e.target.getLatLng();
                            setPickedCoords({ lat, lng });
                          }
                        }}
                      >
                        <Popup>New Location<br /><small>{pickedCoords.lat.toFixed(5)}, {pickedCoords.lng.toFixed(5)}</small></Popup>
                      </Marker>
                    )}
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

export default Locations;
