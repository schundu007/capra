import { useState, useEffect } from 'react';
import { getApiUrl } from '../hooks/useElectron';

const API_URL = getApiUrl();

const ROLES = ['user', 'developer', 'manager', 'admin'];

const ROLE_COLORS = {
  user: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  developer: 'bg-green-500/20 text-green-400 border-green-500/30',
  manager: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminPanel({ token, onClose, theme = 'dark' }) {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

  const isDark = theme === 'dark';

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersRes, pendingRes] = await Promise.all([
        fetch(API_URL + '/api/auth/admin/users', { headers: getAuthHeaders() }),
        fetch(API_URL + '/api/auth/admin/pending', { headers: getAuthHeaders() }),
      ]);

      if (!usersRes.ok || !pendingRes.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();

      setUsers(usersData.users || []);
      setPendingUsers(pendingData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRoles = async (username, newRoles) => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch(API_URL + `/api/auth/admin/users/${username}/roles`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roles: newRoles }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update roles');
      }

      setSuccess(`Roles updated for ${username}`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response = await fetch(API_URL + `/api/auth/admin/users/${username}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess(`User ${username} deleted`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveUser = (username) => {
    handleUpdateRoles(username, ['user']);
  };

  const toggleRole = (user, role) => {
    const currentRoles = user.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    handleUpdateRoles(user.username, newRoles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'border-neutral-800' : 'border-neutral-200'
        }`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            User Management
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex px-6 pt-4 gap-2 ${isDark ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'pending'
                ? isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-900'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Pending Approval
            {pendingUsers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'all'
                ? isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-900'
                : isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            All Users ({users.length})
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-neutral-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : activeTab === 'pending' ? (
            // Pending Users
            pendingUsers.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                No pending users
              </div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map(user => (
                  <div
                    key={user.username}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {user.name}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        @{user.username}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveUser(user.username)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // All Users
            <div className="space-y-3">
              {users.map(user => (
                <div
                  key={user.username}
                  className={`p-4 rounded-lg ${isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {user.name}
                        {user.isEnvUser && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-amber-600/20 text-amber-400">
                            ENV
                          </span>
                        )}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        @{user.username}
                      </p>
                    </div>
                    {!user.isEnvUser && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-200 text-neutral-500 hover:text-red-500'
                        }`}
                        title="Delete user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => {
                      const hasRole = (user.roles || []).includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => !user.isEnvUser && toggleRole(user, role)}
                          disabled={user.isEnvUser}
                          className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                            hasRole
                              ? ROLE_COLORS[role]
                              : isDark
                                ? 'bg-neutral-700/50 text-neutral-500 border-neutral-600 hover:border-neutral-500'
                                : 'bg-neutral-200/50 text-neutral-400 border-neutral-300 hover:border-neutral-400'
                          } ${user.isEnvUser ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
