import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setFeedbacks(data);
      } else {
        console.error('Server error:', data.message);
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/manage-system/login');
        } else {
          setFeedbacks([]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: 'resolved' } : f));
    } catch (error) {
      console.error('Error resolving feedback:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setFeedbacks(feedbacks.filter(f => f._id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Manage Feedbacks</h1>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(fb => (
              <tr key={fb._id}>
                <td data-label="Name">{fb.name}</td>
                <td data-label="Email">{fb.email}</td>
                <td data-label="Message">{fb.message}</td>
                <td data-label="Date">{new Date(fb.createdAt).toLocaleDateString()}</td>
                <td data-label="Status">
                  <span style={{ color: (fb.status || 'pending') === 'resolved' ? 'green' : 'orange' }}>
                    {(fb.status || 'pending').toUpperCase()}
                  </span>
                </td>
                <td data-label="Actions">
                  {(fb.status || 'pending') === 'pending' && (
                    <button className="action-btn resolve-btn" onClick={() => handleResolve(fb._id)}>Resolve</button>
                  )}
                  <button className="action-btn delete-btn" onClick={() => handleDelete(fb._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Feedbacks;
