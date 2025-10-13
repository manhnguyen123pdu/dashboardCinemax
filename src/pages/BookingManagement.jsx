// BookingManagement.jsx
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './BookingManagement.css';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await dashboardAPI.getBookings();
      // Lấy thêm thông tin film và showtime cho mỗi booking
      const bookingsWithDetails = await Promise.all(
        bookingsData.map(async (booking) => {
          const films = await dashboardAPI.getFilms();
          const showtimes = await dashboardAPI.getShowtimes();
          
          const film = films.find(f => f.id === booking.filmId);
          const showtime = showtimes.find(st => st.id === booking.showtimeId);
          
          return {
            ...booking,
            film,
            showtime
          };
        })
      );
      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.film?.nameFilm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      booking.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await dashboardAPI.updateBookingStatus(bookingId, newStatus);
      fetchBookings(); // Refresh list
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn đặt vé này?')) {
      try {
        await dashboardAPI.deleteBooking(bookingId);
        fetchBookings(); // Refresh list
        alert('Xóa đơn đặt vé thành công!');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Có lỗi xảy ra khi xóa đơn đặt vé!');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Chờ xác nhận', class: 'bm-pending' },
      'confirmed': { text: 'Đã xác nhận', class: 'bm-confirmed' },
      'cancelled': { text: 'Đã hủy', class: 'bm-cancelled' },
      'completed': { text: 'Hoàn thành', class: 'bm-completed' }
    };
    const config = statusConfig[status] || { text: status, class: 'bm-pending' };
    return <span className={`bm-status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="bm-loading">
        <div className="bm-spinner"></div>
        <p>Đang tải danh sách đơn đặt vé...</p>
      </div>
    );
  }

  return (
    <div className="bm-container">
      {/* Header */}
      <div className="bm-header">
        <div className="bm-header-content">
          <h1>🎫 Quản lý Đơn đặt vé</h1>
          <p>Quản lý và theo dõi tất cả đơn đặt vé</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bm-stats">
        <div className="bm-stat-item">
          <div className="bm-stat-number">{bookings.length}</div>
          <div className="bm-stat-label">Tổng đơn</div>
        </div>
        <div className="bm-stat-item">
          <div className="bm-stat-number">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
          <div className="bm-stat-label">Chờ xác nhận</div>
        </div>
        <div className="bm-stat-item">
          <div className="bm-stat-number">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div className="bm-stat-label">Đã xác nhận</div>
        </div>
        <div className="bm-stat-item">
          <div className="bm-stat-number">
            {bookings.filter(b => b.status === 'completed').length}
          </div>
          <div className="bm-stat-label">Hoàn thành</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bm-filters">
        <div className="bm-search-box">
          <div className="bm-search-icon">🔍</div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng, phim hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bm-search-input"
          />
        </div>
        
        <div className="bm-filter-buttons">
          <button 
            className={`bm-filter-btn ${filter === 'all' ? 'bm-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`bm-filter-btn ${filter === 'pending' ? 'bm-active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ xác nhận
          </button>
          <button 
            className={`bm-filter-btn ${filter === 'confirmed' ? 'bm-active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Đã xác nhận
          </button>
          <button 
            className={`bm-filter-btn ${filter === 'completed' ? 'bm-active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Hoàn thành
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bm-table">
        {filteredBookings.length === 0 ? (
          <div className="bm-empty">
            <div className="bm-empty-icon">🎫</div>
            <h3>Không tìm thấy đơn đặt vé</h3>
            <p>Không có đơn đặt vé nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        ) : (
          <div className="bm-list">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="bm-card">
                <div className="bm-card-header">
                  <div className="bm-card-info">
                    <h3>Mã đơn: {booking.id}</h3>
                    <div className="bm-customer-info">
                      <strong>Khách hàng:</strong> {booking.customerName} - {booking.customerPhone} - {booking.customerEmail}
                    </div>
                  </div>
                  <div className="bm-card-status">
                    {getStatusBadge(booking.status)}
                    <div className="bm-booking-date">
                      {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="bm-card-details">
                  <div className="bm-film-info">
                    <div className="bm-film-poster">
                      <img src={booking.film?.img?.[0]} alt={booking.film?.nameFilm} />
                    </div>
                    <div className="bm-film-details">
                      <h4>{booking.film?.nameFilm}</h4>
                      <div className="bm-showtime-info">
                        <span>📅 {booking.showtime && formatDateTime(booking.showtime.datetime)}</span>
                        <span>🎬 Phòng {booking.showtime?.roomId?.replace('room_', '')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bm-seats-info">
                    <strong>Ghế đã đặt:</strong>
                    <div className="bm-seats-list">
                      {booking.seats?.map(seat => (
                        <span key={seat} className="bm-seat-tag">{seat}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bm-payment-info">
                    <div className="bm-payment-details">
                      <span><strong>Tổng tiền:</strong> {formatCurrency(booking.totalAmount)}</span>
                      <span><strong>Phương thức:</strong> {booking.paymentMethod}</span>
                      {booking.paymentStatus && (
                        <span><strong>Trạng thái thanh toán:</strong> {booking.paymentStatus}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bm-card-actions">
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        className="bm-btn-confirm"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        Xác nhận
                      </button>
                      <button 
                        className="bm-btn-cancel"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      >
                        Hủy đơn
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      className="bm-btn-complete"
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                    >
                      Hoàn thành
                    </button>
                  )}
                  <button 
                    className="bm-btn-delete"
                    onClick={() => deleteBooking(booking.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;