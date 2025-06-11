// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../constant';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('petugas');
    navigate('/login');
  };


  return (
    <nav style={{
      background: '#2c3e50',
      padding: '1rem 2rem',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{APP_NAME}</div>

      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/books">Buku</NavLink>
            <NavLink to="/members">Member</NavLink>
            <NavLink to="/transactions">Peminjaman</NavLink>
            <NavLink to="/denda">Denda</NavLink>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc3545',
                border: 'none',
                color: '#fff',
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                borderRadius: '5px',
                marginLeft: '1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
};

// Komponen helper untuk Link dengan styling
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      color: '#fff',
      margin: '0 1.2rem',
      textDecoration: 'none',
      fontSize: '1.05rem',
      fontWeight: '500',
      transition: 'color 0.2s ease'
    }}
    onMouseEnter={(e) => e.target.style.color = '#f8f9fa'}
    onMouseLeave={(e) => e.target.style.color = '#fff'}
  >
    {children}
  </Link>
);

// Komponen khusus untuk dropdown link
const DropdownLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      display: 'block',
      padding: '0.8rem 1.2rem',
      color: '#333',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = '#f8f9fa';
      e.target.style.color = '#2c3e50';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = '#fff';
      e.target.style.color = '#333';
    }}
  >
    {children}
  </Link>
);

export default Navbar;