import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import ConfirmModal from './ConfirmModal';
import './admin.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });

      // Sort by newest first
      usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const userId = deleteModal.userId;
    setDeleteModal({ isOpen: false, userId: null, userName: '' });
    try {
      await setDoc(doc(db, "deletedUsers", userId), { deletedAt: new Date().toISOString() });
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user data.");
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading users...</div>;

  if (error) return (
    <div style={{ padding: '20px', color: 'red', background: '#fff0f0', borderRadius: '8px', border: '1px solid #fecaca' }}>
      <strong>⚠️ Error loading users:</strong>
      <p style={{ marginTop: '8px' }}>{error}</p>
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
        This may be a Firestore security rules issue. Go to <strong>Firebase Console → Firestore → Rules</strong> and ensure read is allowed for the <code>users</code> collection.
      </p>
      <button onClick={fetchUsers} style={{ marginTop: '12px', padding: '8px 16px', background: '#1d3557', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  // Filter and search logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone?.includes(searchTerm));
    
    const matchesPurpose = filterPurpose ? user.purpose === filterPurpose : true;
    const matchesOrg = filterOrg ? user.organization?.toLowerCase().includes(filterOrg.toLowerCase()) : true;
    const matchesDesig = filterDesignation ? user.designation === filterDesignation : true;
    
    let matchesDate = true;

    if (filterDate) {
       const d = new Date(user.createdAt);
       const localDateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
       matchesDate = localDateStr === filterDate;
    }

    return matchesSearch && matchesPurpose && matchesOrg && matchesDesig && matchesDate;
  });

  const uniquePurposes = [...new Set(users.map(u => u.purpose).filter(Boolean))];
  const uniqueDesigs = [...new Set(users.map(u => u.designation).filter(Boolean))];

  const handleExportExcel = () => {
    const exportData = filteredUsers.map((u, i) => ({
      '#': i + 1,
      'Name': u.name || '',
      'Email': u.email || '',
      'Phone': u.phone || '',
      'Purpose of Visit': u.purpose || '',
      'Organization': u.organization || '',
      'Designation': u.designation || 'N/A',
      'Date Joined': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length, ...exportData.map(r => String(r[key] || '').length))
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteModal.userName}'s data? They will be forcefully logged out and must re-register.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="#ef4444"
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <h2>User Registrations <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal', marginLeft: '10px' }}>({filteredUsers.length} total)</span></h2>
        <button
          onClick={handleExportExcel}
          disabled={filteredUsers.length === 0}
          style={{ padding: '9px 18px', background: filteredUsers.length === 0 ? '#ccc' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: filteredUsers.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
        >
          ⬇ Download as Excel ({filteredUsers.length})
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search name, email, phone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '220px' }}
        />
        <input 
          type="date" 
          value={filterDate} 
          onChange={(e) => setFilterDate(e.target.value)} 
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '150px' }} 
          title="Filter by exact date"
        />
        <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
          <option value="">All Purposes</option>
          {uniquePurposes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input 
          type="text" 
          placeholder="Search organization..." 
          value={filterOrg}
          onChange={(e) => setFilterOrg(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '180px' }}
        />
        <select value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
          <option value="">All Designations</option>
          {uniqueDesigs.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      
      {filteredUsers.length === 0 ? (
        <p>No registered users found matching your filters.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Organization</th>
                <th>Designation</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td data-label="Profile">
                    {(user.photoURL || user.photo || user.photoUrl || user.avatar) ? (
                      <img
                        src={user.photoURL || user.photo || user.photoUrl || user.avatar}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: (user.photoURL || user.photo || user.photoUrl || user.avatar) ? 'none' : 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '700', fontSize: '1rem'
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </td>
                  <td data-label="Name" style={{ fontWeight: '500' }}>{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Phone">{user.phone}</td>
                  <td data-label="Purpose">
                    <span style={{ fontSize: '0.9em', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                      {user.purpose}
                    </span>
                  </td>
                  <td data-label="Organization">{user.organization}</td>
                  <td data-label="Designation">{user.designation || 'N/A'}</td>
                  <td data-label="Joined">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <button className="action-btn delete-btn" onClick={() => setDeleteModal({ isOpen: true, userId: user.id, userName: user.name || 'this user' })}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
