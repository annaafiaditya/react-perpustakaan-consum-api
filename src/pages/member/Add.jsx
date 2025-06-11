// src/pages/member/Add.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const AddMemberPage = () => {
  const [formData, setFormData] = useState({
    no_ktp: '',
    nama: '',
    alamat: '',
    tgl_lahir: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      alert('Anda belum login atau sesi telah berakhir.');
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}${API_ENDPOINTS.MEMBERS}`, formData, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Member added successfully:', response.data);
      alert('Member berhasil ditambahkan!');
      navigate('/members');

    } catch (err) {
      console.error('Error adding member:', err.response?.data || err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join('\n');
        setError(`Validasi Gagal:\n${validationErrors}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Gagal menambahkan member. Terjadi kesalahan jaringan atau server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Tambah Member Baru</h1>
      <form onSubmit={handleSubmit} className="form-card">
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="no_ktp">No KTP:</label>
          <input
            type="text"
            id="no_ktp"
            name="no_ktp"
            value={formData.no_ktp}
            onChange={handleChange}
            className="form-control"
            required
            maxLength={16}
          />
        </div>
        <div className="form-group">
          <label htmlFor="nama">Nama:</label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="alamat">Alamat:</label>
          <textarea
            id="alamat"
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            className="form-control"
            rows="3"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tgl_lahir">Tanggal Lahir:</label>
          <input
            type="date"
            id="tgl_lahir"
            name="tgl_lahir"
            value={formData.tgl_lahir}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Menambahkan...' : 'Simpan Member'}
          </button>
          <button type="button" className="button secondary" onClick={() => navigate('/members')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberPage;