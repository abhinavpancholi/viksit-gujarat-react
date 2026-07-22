import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps any route that requires a logged-in user.
 * If there is no currentUser, redirects to /login, passing the attempted
 * URL in location.state.from so LoginPage can redirect back after sign-in.
 */
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
