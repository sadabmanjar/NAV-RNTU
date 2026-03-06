import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../integration-styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const EVENT_COLORS = {
  Seminar: '#3b82f6', Sports: '#22c55e', Cultural: '#f59e0b',
  Workshop: '#8b5cf6', Exam: '#ef4444', Meeting: '#06b6d4',
  Conference: '#ec4899', Other: '#64748b',
};

const EVENT_ICONS = {
  Seminar: '🎓', Sports: '⚽', Cultural: '🎭', Workshop: '🛠️',
  Exam: '📝', Meeting: '🤝', Conference: '🎤', Other: '📅',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const isUpcoming = (d) => new Date(d) >= new Date(new Date().setHours(0, 0, 0, 0));

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | upcoming | past
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/events`);
        const data = await res.json();
        // Sort newest date first
        setEvents(Array.isArray(data) ? data.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(ev => {
    if (filter === 'upcoming') return isUpcoming(ev.date);
    if (filter === 'past') return !isUpcoming(ev.date);
    return true;
  });

  return (
    <div className="events-page-container">
      <style>{`
        .events-page-container {
          padding-top: 90px;
          min-height: 100vh;
          padding-bottom: 60px;
        }
        .events-header {
          text-align: center;
          margin-bottom: 36px;
          padding: 0 20px;
        }
        .events-header h1 {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          color: #fff;
          margin: 0 0 8px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .events-header p {
          color: rgba(255,255,255,0.75);
          font-size: 1rem;
          margin: 0;
        }
        .events-filter-bar {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          padding: 0 20px;
        }
        .filter-btn {
          padding: 8px 22px;
          border-radius: 99px;
          border: 1.5px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .filter-btn.active, .filter-btn:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.5);
          color: #fff;
        }
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .event-card {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
        }
        .event-card-banner {
          height: 8px;
        }
        .event-card-body {
          padding: 20px;
        }
        .event-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }
        .event-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.3;
        }
        .event-description {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          margin: 0 0 16px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.65);
        }
        .event-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .event-navigate-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .event-navigate-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .past-badge {
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(100,116,139,0.3);
          color: rgba(255,255,255,0.5);
          margin-left: 6px;
          vertical-align: middle;
        }
        .events-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.5);
        }
        .events-empty .empty-icon { font-size: 3.5rem; margin-bottom: 16px; }
        .events-loading {
          text-align: center;
          padding: 80px;
          color: rgba(255,255,255,0.6);
          font-size: 1rem;
        }
      `}</style>

      {/* Hero header */}
      <div className="events-header">
        <h1>🎉 Campus Events</h1>
        <p>Stay updated with all upcoming activities and happenings on campus</p>
      </div>

      {/* Filter bar */}
      <div className="events-filter-bar">
        {['all', 'upcoming', 'past'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? '📋 All Events' : f === 'upcoming' ? '🔜 Upcoming' : '🕒 Past'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="events-loading">⏳ Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="events-empty">
          <div className="empty-icon">📭</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
            No {filter !== 'all' ? filter : ''} events found
          </div>
          <div style={{ fontSize: '0.88rem' }}>Check back soon for updates from the campus!</div>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map(ev => {
            const color = EVENT_COLORS[ev.eventType] || '#64748b';
            const icon = EVENT_ICONS[ev.eventType] || '📅';
            const upcoming = isUpcoming(ev.date);
            return (
              <div key={ev._id} className="event-card">
                <div className="event-card-banner" style={{ background: color }} />
                <div className="event-card-body">
                  <div className="event-type-badge" style={{ background: `${color}25`, color }}>
                    {icon} {ev.eventType || 'Event'}
                    {!upcoming && <span className="past-badge">Past</span>}
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-description">{ev.description}</p>
                  <div className="event-meta">
                    <span>📅 {formatDate(ev.date)}{ev.time ? ` · ${formatTime(ev.time)}` : ''}</span>
                    <span>📍 {ev.locationName}</span>
                  </div>
                  <button
                    className="event-navigate-btn"
                    style={{ background: upcoming ? color : 'rgba(100,116,139,0.3)', color: '#fff' }}
                    onClick={() => navigate('/')}
                  >
                    🗺️ View on Map
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
