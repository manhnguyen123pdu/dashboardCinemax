import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../redux/slices/authSlice'
import './AdminHeader.css'

const AdminHeader = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="admin-header">
      <div className="header-left">
        <h1>Admin Dashboard</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-avatar">{user?.avatar || '👨‍💼'}</span>
          <span className="user-name">{user?.fullName}</span>
          <span className="user-role">({user?.role})</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  )
}

export default AdminHeader