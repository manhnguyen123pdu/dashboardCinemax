// ShowtimeManagement.jsx
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './ShowtimeManagement.css';

const ShowtimeManagement = () => {
  const [films, setFilms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    filmId: '',
    cinemaId: 'cinema_default',
    roomId: 'room_1',
    date: '',
    time: '',
    price: '',
    discount: 0,
    format: '2D',
    language: 'Phụ đề Việt',
    availableSeats: 80,
    totalSeats: 120
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filmsData, showtimesData] = await Promise.all([
        dashboardAPI.getFilms(),
        dashboardAPI.getShowtimes()
      ]);
      setFilms(filmsData);
      setShowtimes(showtimesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilmShowtimes = (filmId) => {
    return showtimes.filter(st => st.filmId === filmId)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  };

  const handleAddShowtime = (film) => {
    setFormData({
      filmId: film.id,
      cinemaId: 'cinema_default',
      roomId: 'room_1',
      date: '',
      time: '',
      price: '',
      discount: 0,
      format: '2D',
      language: 'Phụ đề Việt',
      availableSeats: 80,
      totalSeats: 120
    });
    setEditingShowtime(null);
    setShowForm(true);
  };

  const handleEditShowtime = (showtime) => {
    const datetime = new Date(showtime.datetime);
    setFormData({
      filmId: showtime.filmId,
      cinemaId: showtime.cinemaId,
      roomId: showtime.roomId,
      date: datetime.toISOString().split('T')[0],
      time: datetime.toTimeString().slice(0, 5),
      price: showtime.price,
      discount: showtime.discount,
      format: showtime.format,
      language: showtime.language,
      availableSeats: showtime.availableSeats,
      totalSeats: showtime.totalSeats
    });
    setEditingShowtime(showtime);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datetime = `${formData.date}T${formData.time}:00Z`;
      const showtimeData = {
        filmId: formData.filmId,
        cinemaId: formData.cinemaId,
        roomId: formData.roomId,
        datetime: datetime,
        price: parseInt(formData.price),
        discount: parseInt(formData.discount),
        format: formData.format,
        language: formData.language,
        availableSeats: parseInt(formData.availableSeats),
        totalSeats: parseInt(formData.totalSeats)
      };

      if (editingShowtime) {
        showtimeData.id = editingShowtime.id;
        await dashboardAPI.updateShowtime(editingShowtime.id, showtimeData);
      } else {
        const showtimeId = `showtime_${formData.filmId}_${formData.date.replace(/-/g, '')}_${formData.time.replace(':', '')}`;
        showtimeData.id = showtimeId;
        await dashboardAPI.addShowtime(showtimeData);
      }

      setShowForm(false);
      fetchData();
      alert(editingShowtime ? 'Cập nhật thành công!' : 'Thêm xuất chiếu thành công!');
    } catch (error) {
      console.error('Error saving showtime:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xuất chiếu này?')) {
      try {
        await dashboardAPI.deleteShowtime(showtimeId);
        fetchData();
      } catch (error) {
        console.error('Error deleting showtime:', error);
        alert('Có lỗi xảy ra khi xóa xuất chiếu!');
      }
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('vi-VN'),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="stm-wrapper stm-loading">
        <div className="stm-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (selectedFilm) {
    const filmShowtimes = getFilmShowtimes(selectedFilm.id);

    return (
      <div className="stm-wrapper">
        <div className="stm-header">
          <div className="stm-header-main">
            <button className="stm-back-button" onClick={() => setSelectedFilm(null)}>
              <span className="stm-back-arrow">←</span>
              Quay lại danh sách
            </button>
            <div className="stm-film-details">
              <h1>{selectedFilm.nameFilm}</h1>
              <p>Quản lý xuất chiếu</p>
            </div>
          </div>
          <button 
            className="stm-add-button"
            onClick={() => handleAddShowtime(selectedFilm)}
          >
            <span className="stm-button-icon">+</span>
            Thêm xuất chiếu
          </button>
        </div>

        <div className="stm-content-area">
          <div className="stm-section-title-bar">
            <h2>Danh sách xuất chiếu</h2>
            <span className="stm-count-badge">{filmShowtimes.length} xuất chiếu</span>
          </div>

          {filmShowtimes.length === 0 ? (
            <div className="stm-empty-screen">
              <div className="stm-empty-image">🎬</div>
              <h3>Chưa có xuất chiếu nào</h3>
              <p>Hãy thêm xuất chiếu đầu tiên cho phim này</p>
              <button 
                className="stm-add-button"
                onClick={() => handleAddShowtime(selectedFilm)}
              >
                Thêm xuất chiếu đầu tiên
              </button>
            </div>
          ) : (
            <div className="stm-showtimes-container">
              {filmShowtimes.map(showtime => {
                const { date, time } = formatDateTime(showtime.datetime);
                return (
                  <div key={showtime.id} className="stm-showtime-box">
                    <div className="stm-showtime-top">
                      <div className="stm-time-info">
                        <span className="stm-show-date">{date}</span>
                        <span className="stm-show-time">{time}</span>
                      </div>
                      <div className="stm-action-buttons">
                        <button
                          className="stm-edit-button"
                          onClick={() => handleEditShowtime(showtime)}
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="stm-delete-button"
                          onClick={() => handleDeleteShowtime(showtime.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="stm-showtime-info">
                      <div className="stm-info-line">
                        <span className="stm-info-label">Phòng:</span>
                        <span className="stm-info-text">{showtime.roomId}</span>
                      </div>
                      <div className="stm-info-line">
                        <span className="stm-info-label">Định dạng:</span>
                        <span className="stm-info-text">{showtime.format} • {showtime.language}</span>
                      </div>
                      <div className="stm-info-line">
                        <span className="stm-info-label">Giá vé:</span>
                        <span className="stm-info-text stm-price-tag">
                          {showtime.price.toLocaleString()} VND
                          {showtime.discount > 0 && (
                            <span className="stm-discount-text"> (-{showtime.discount}%)</span>
                          )}
                        </span>
                      </div>
                      <div className="stm-info-line">
                        <span className="stm-info-label">Ghế trống:</span>
                        <span className="stm-info-text stm-seats-info">
                          {showtime.availableSeats}/{showtime.totalSeats}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showForm && (
          <div className="stm-modal-backdrop">
            <div className="stm-modal-window">
              <div className="stm-modal-top">
                <h2>{editingShowtime ? 'Sửa xuất chiếu' : 'Thêm xuất chiếu mới'}</h2>
                <button 
                  className="stm-close-button"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="stm-modal-form">
                <div className="stm-form-sections">
                  <div className="stm-form-block">
                    <h3>Thông tin cơ bản</h3>
                    <div className="stm-form-layout">
                      <div className="stm-input-group">
                        <label>Phòng chiếu *</label>
                        <select
                          value={formData.roomId}
                          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                          required
                        >
                          <option value="room_1">Phòng 1</option>
                          <option value="room_2">Phòng 2</option>
                          <option value="room_3">Phòng 3</option>
                          <option value="room_4">Phòng 4</option>
                        </select>
                      </div>

                      <div className="stm-input-group">
                        <label>Ngày chiếu *</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="stm-input-group">
                        <label>Giờ chiếu *</label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                        />
                      </div>

                      <div className="stm-input-group">
                        <label>Định dạng</label>
                        <select
                          value={formData.format}
                          onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        >
                          <option value="2D">2D</option>
                          <option value="3D">3D</option>
                          <option value="IMAX">IMAX</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="stm-form-block">
                    <h3>Giá vé & Chỗ ngồi</h3>
                    <div className="stm-form-layout">
                      <div className="stm-input-group">
                        <label>Giá vé (VND) *</label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          min="0"
                          required
                        />
                      </div>

                      <div className="stm-input-group">
                        <label>Giảm giá (%)</label>
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          min="0"
                          max="100"
                        />
                      </div>

                      <div className="stm-input-group">
                        <label>Ghế trống *</label>
                        <input
                          type="number"
                          value={formData.availableSeats}
                          onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
                          min="0"
                          required
                        />
                      </div>

                      <div className="stm-input-group">
                        <label>Tổng số ghế *</label>
                        <input
                          type="number"
                          value={formData.totalSeats}
                          onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="stm-form-block">
                    <h3>Thông tin khác</h3>
                    <div className="stm-form-layout">
                      <div className="stm-input-group stm-full-row">
                        <label>Ngôn ngữ</label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                          <option value="Phụ đề Việt">Phụ đề Việt</option>
                          <option value="Lồng tiếng Việt">Lồng tiếng Việt</option>
                          <option value="Nguyên bản">Nguyên bản</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stm-form-footer">
                  <button 
                    type="button" 
                    className="stm-cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="stm-save-button">
                    {editingShowtime ? 'Cập nhật' : 'Thêm xuất chiếu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Film list view
  return (
    <div className="stm-wrapper">
      <div className="stm-header">
        <div className="stm-header-main">
          <h1>Quản lý Xuất chiếu</h1>
          <p>Chọn phim để quản lý lịch chiếu</p>
        </div>
      </div>

      <div className="stm-content-area">
        <div className="stm-section-title-bar">
          <h2>Danh sách phim</h2>
          <span className="stm-count-badge">{films.length} phim</span>
        </div>

        <div className="stm-films-grid">
          {films.map(film => {
            const filmShowtimes = getFilmShowtimes(film.id);
            return (
              <div 
                key={film.id} 
                className="stm-film-card"
                onClick={() => setSelectedFilm(film)}
              >
                <div className="stm-poster-container">
                  <img src={film.img?.[0]} alt={film.nameFilm} />
                  <div className="stm-showtime-indicator">
                    {filmShowtimes.length} xuất chiếu
                  </div>
                </div>
                <div className="stm-film-content">
                  <h3 className="stm-film-name">{film.nameFilm}</h3>
                  <p className="stm-film-summary">
                    {film.description || 'Chưa có mô tả...'}
                  </p>
                  <div className="stm-genre-list">
                    {film.infoFilm?.category?.slice(0, 3).map((genre, index) => (
                      <span key={index} className="stm-genre-item">{genre}</span>
                    ))}
                  </div>
                  <div className="stm-film-stats">
                    <span className="stm-duration">⏱️ {film.infoFilm?.duration || 'N/A'} phút</span>
                    <span className="stm-rating">⭐ {film.ratedView?.imdb || 'N/A'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShowtimeManagement;