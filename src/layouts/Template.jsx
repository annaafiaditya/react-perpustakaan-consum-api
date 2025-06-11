// src/layouts/Template.jsx
import React from 'react';
import Navbar from '../components/Navbar';

const Template = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        {children}
      </main>
    </div>
  );
};

export default Template;