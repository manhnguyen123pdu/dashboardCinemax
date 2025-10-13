// UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await dashboardAPI.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active'
    });
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // Cập nhật user
        await dashboardAPI.updateUser(selectedUser.id, formData);
        alert('Cập nhật người dùng thành công!');
      } else {
        // Thêm user mới
        const userData = {
          ...formData,
          id: `user_${Math.random().toString(36).substr(2, 9)}`,
          avatar: '👤',
          createdAt: new Date().toISOString()
        };
        await dashboardAPI.addUser(userData);
        alert('Thêm người dùng thành công!');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await dashboardAPI.deleteUser(userId);
        fetchUsers();
        alert('Xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Có lỗi xảy ra khi xóa người dùng!');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await dashboardAPI.updateUserStatus(userId, newStatus);
      fetchUsers();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { text: 'Quản trị', class: 'um-role-admin' },
      'user': { text: 'Người dùng', class: 'um-role-user' }
    };
    const config = roleConfig[role] || { text: role, class: 'um-role-user' };
    return <span className={`um-role-badge ${config.class}`}>{config.text}</span>;
  };
  const getStatusBadge = (status) => {
    return status === 'active'
      ? <span className="um-status-active">🟢 Đang hoạt động</span>
      : <span className="um-status-inactive">🔴 Ngừng hoạt động</span>;
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="um-loading">
        <div className="um-spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <div className="um-container">
      {/* Header */}
      <div className="um-header">
        <div className="um-header-content">
          <h1>👥 Quản lý Người dùng</h1>
          <p>Quản lý thông tin và phân quyền người dùng hệ thống</p>
        </div>
        <button className="um-add-btn" onClick={handleAddUser}>
          <span className="um-btn-icon">➕</span>
          Thêm Người dùng
        </button>
      </div>

      {/* Stats */}

      <div className="um-stats">
        <div className="um-stat-item">
          <div className="um-stat-number">{users.length}</div>
          <div className="um-stat-label">Tổng người dùng</div>
        </div>
        <div className="um-stat-item">
          <div className="um-stat-number">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="um-stat-label">Quản trị viên</div>
        </div>
        
        <div className="um-stat-item">
          <div className="um-stat-number">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="um-stat-label">Đang hoạt động</div>
        </div>
      </div>


      {/* Filters */}
      <div className="um-filters">
        <div className="um-search-box">
          <div className="um-search-icon">🔍</div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="um-search-input"
          />
        </div>

        <div className="um-filter-buttons">
          <button
            className={`um-filter-btn ${roleFilter === 'all' ? 'um-active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`um-filter-btn ${roleFilter === 'admin' ? 'um-active' : ''}`}
            onClick={() => setRoleFilter('admin')}
          >
            Quản trị
          </button>

          <button
            className={`um-filter-btn ${roleFilter === 'user' ? 'um-active' : ''}`}
            onClick={() => setRoleFilter('user')}
          >
            Người dùng
          </button>
        </div>

      </div>

      {/* Users Table */}
      <div className="um-table">
        {filteredUsers.length === 0 ? (
          <div className="um-empty">
            <div className="um-empty-icon">👥</div>
            <h3>Không tìm thấy người dùng</h3>
            <p>Không có người dùng nào phù hợp với tiêu chí tìm kiếm.</p>
            <button className="um-add-btn" onClick={handleAddUser}>
              Thêm người dùng đầu tiên
            </button>
          </div>
        ) : (
          <div className="um-list">
            {filteredUsers.map(user => (
              <div key={user.id} className="um-card">
                <div className="um-card-header">
                  <div className="um-user-avatar">
                    <span className="um-avatar">{user.avatar || '👤'}</span>
                  </div>
                  <div className="um-user-info">
                    <h3>{user.fullName}</h3>
                    <div className="um-user-meta">
                      <span className="um-user-email">📧 {user.email}</span>
                      <span className="um-user-phone">📞 {user.phone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                  <div className="um-user-status">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                    <div className="um-user-date">
                      Tham gia: {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="um-card-actions">
                  <button
                    className="um-edit-btn"
                    onClick={() => handleEditUser(user)}
                    title="Chỉnh sửa"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    className="um-status-btn"
                    onClick={() => toggleUserStatus(user.id, user.status)}
                    title="Đổi trạng thái"
                  >
                    {user.status === 'active' ? '⏸️ Tạm dừng' : '▶️ Kích hoạt'}
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      className="um-delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa"
                    >
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <div className="um-modal-header">
              <h2>{selectedUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới'}</h2>
              <button
                className="um-close-btn"
                onClick={() => setShowUserModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="um-modal-form">
              <div className="um-form-grid">
                <div className="um-form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div className="um-form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div className="um-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="um-form-group">
                  <label>Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">Người dùng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>

                <div className="um-form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="um-form-actions">
                <button
                  type="button"
                  className="um-cancel-btn"
                  onClick={() => setShowUserModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="um-submit-btn">
                  {selectedUser ? 'Cập nhật' : 'Thêm người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;