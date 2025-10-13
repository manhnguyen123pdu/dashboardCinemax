import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { dashboardAPI } from '../services/api'
import './Dashboard.css'

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFilms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0
  })
  
  const [recentBookings, setRecentBookings] = useState([])
  const [popularFilms, setPopularFilms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch data từ API
      const [users, films, bookings] = await Promise.all([
        dashboardAPI.getUsers(),
        dashboardAPI.getFilms(),
        dashboardAPI.getBookings()
      ])

      // Tính toán stats
      const today = new Date().toISOString().split('T')[0]
      const todayBookings = bookings.filter(booking => 
        booking.createdAt?.includes(today)
      )

      const totalRevenue = bookings.reduce((sum, booking) => 
        sum + (booking.totalAmount || 0), 0
      )

      // Popular films
      const filmBookingsCount = {}
      bookings.forEach(booking => {
        filmBookingsCount[booking.filmId] = (filmBookingsCount[booking.filmId] || 0) + 1
      })

      const popularFilmsList = films
        .map(film => ({
          ...film,
          bookingCount: filmBookingsCount[film.id] || 0
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5)

      // Recent bookings
      const recentBookingsList = bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)

      setStats({
        totalUsers: users.length,
        totalFilms: films.length,
        totalBookings: bookings.length,
        totalRevenue,
        todayBookings: todayBookings.length
      })

      setRecentBookings(recentBookingsList)
      setPopularFilms(popularFilmsList)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Tổng quan</h1>
        <p>Chào mừng trở lại, {user?.fullName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Doanh thu</h3>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-change">Tổng doanh thu</div>
          </div>
        </div>

        <div className="stat-card bookings">
          <div className="stat-icon">🎫</div>
          <div className="stat-info">
            <h3>Đơn đặt vé</h3>
            <div className="stat-value">{stats.totalBookings}</div>
            <div className="stat-change">{stats.todayBookings} đơn hôm nay</div>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Người dùng</h3>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-change">Người dùng hệ thống</div>
          </div>
        </div>

        <div className="stat-card films">
          <div className="stat-icon">🎬</div>
          <div className="stat-info">
            <h3>Phim</h3>
            <div className="stat-value">{stats.totalFilms}</div>
            <div className="stat-change">Phim đang chiếu</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Bookings */}
        <div className="content-card">
          <div className="card-header">
            <h3>Đơn đặt vé gần đây</h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/admin/bookings')}
            >
              Xem tất cả
            </button>
          </div>
          <div className="bookings-list">
            {recentBookings.map(booking => (
              <div key={booking.id} className="booking-item">
                <div className="booking-info">
                  <div className="booking-id">#{booking.id.slice(-6)}</div>
                  <div className="film-name">{booking.filmName}</div>
                  <div className="booking-date">{formatDate(booking.createdAt)}</div>
                </div>
                <div className="booking-amount">
                  {formatCurrency(booking.totalAmount || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Films */}
        <div className="content-card">
          <div className="card-header">
            <h3>Phim phổ biến</h3>
          </div>
          <div className="popular-films">
            {popularFilms.map((film, index) => (
              <div key={film.id} className="popular-film">
                <div className="film-rank">#{index + 1}</div>
                <img src={film.img?.[0]} alt={film.nameFilm} className="film-thumb" />
                <div className="film-details">
                  <h4>{film.nameFilm}</h4>
                  <p>{film.bookingCount} lượt đặt</p>
                </div>
                <div className="film-rating">⭐ {film.ratedView?.imdb || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage