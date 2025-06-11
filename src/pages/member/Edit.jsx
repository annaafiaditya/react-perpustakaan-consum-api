// src/pages/member/Edit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const EditMemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    no_ktp: '',
    nama: '',
    alamat: '',
    tgl_lahir: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}${API_ENDPOINTS.MEMBERS}/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const memberData = response.data;
        setFormData({
          no_ktp: memberData.no_ktp || '',
          nama: memberData.nama || '',
          alamat: memberData.alamat || '',
          tgl_lahir: memberData.tgl_lahir ? memberData.tgl_lahir.split('T')[0] : '',
        });
      } catch (err) {
        console.error('Error fetching member details:', err.response?.data || err);
        if (err.response?.status === 401) {
          alert('Sesi Anda berakhir. Silakan login kembali.');
          localStorage.clear();
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Member tidak ditemukan.');
        } else {
          setError(err.response?.data?.message || err.message || 'Gagal memuat detail member.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!token) {
      alert('Anda belum login atau sesi telah berakhir.');
      navigate('/login');
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.put(`${API_URL}${API_ENDPOINTS.MEMBERS}/${id}`, formData, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Member updated successfully:', response.data);
      alert('Member berhasil diperbarui!');
      navigate('/members');
    } catch (err) {
      console.error('Error updating member:', err.response?.data || err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Gagal memperbarui member. Periksa input Anda.';
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-container"><p className="loading-message">Memuat detail member...</p></div>;
  }

  if (error && !loading) {
    return <div className="page-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Edit Member</h1>
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
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? 'Memperbarui...' : 'Perbarui Member'}
          </button>
          <button type="button" className="button secondary" onClick={() => navigate('/members')}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMemberPage;