import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

const AdminPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role; // Assuming the role is stored in the token

    if (userRole !== 'admin') {
      // If token exists but user is not an admin, redirect to the login page
      return <Navigate to="/" />;
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    // If token is invalid, redirect to the login page
    return <Navigate to="/" />;
  }

  // If token exists and user is an admin, render the child component
  return children;
};

export default AdminPrivateRoute;
