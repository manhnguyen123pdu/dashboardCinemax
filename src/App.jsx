import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import FilmManagement from './pages/FilmManagement'
import UserManagement from './pages/UserManagement'
import BookingManagement from './pages/BookingManagement'
import ShowtimeManagement from './pages/ShowtimeManagement'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import RoomManagement from './pages/RoomManagement'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Login Route */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="films" element={<FilmManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="showtime" element={<ShowtimeManagement />} />
              <Route path="roomManagement" element={<RoomManagement />} />
              <Route path="" element={<Navigate to="/admin/dashboard" replace />} />

            </Route>

            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  )
}

export default App