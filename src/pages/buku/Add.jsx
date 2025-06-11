// src/pages/buku/Add.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const AddBookPage = () => {
  const [noRak, setNoRak] = useState(''); // New state for no_rak
  const [judul, setJudul] = useState('');
  const [pengarang, setPengarang] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [penerbit, setPenerbit] = useState(''); // New state for penerbit
  const [stok, setStok] = useState(''); // New state for stok
  const [detail, setDetail] = useState(''); // New state for detail
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}${API_ENDPOINTS.BUKU}`, {
        no_rak: noRak, // Include no_rak
        judul,
        pengarang,
        tahun_terbit: tahunTerbit,
        penerbit, // Include penerbit
        stok: stok, // Include stok
        detail, // Include detail
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      // Reset form fields
      setNoRak('');
      setJudul('');
      setPengarang('');
      setTahunTerbit('');
      setPenerbit('');
      setStok('');
      setDetail('');
      setTimeout(() => navigate('/books'), 1500); // Redirect setelah 1.5 detik
    } catch (err) {
      console.error('Error adding book:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('petugas');
        navigate('/login');
      } else {
        setError('Gagal menambahkan buku. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Tambah Buku Baru</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Buku berhasil ditambahkan!</p>}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="noRak">No. Rak:</label>
          <input
            type="text"
            id="noRak"
            className="form-control"
            value={noRak}
            onChange={(e) => setNoRak(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="judul">Judul:</label>
          <input
            type="text"
            id="judul"
            className="form-control"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pengarang">Pengarang:</label>
          <input
            type="text"
            id="pengarang"
            className="form-control"
            value={pengarang}
            onChange={(e) => setPengarang(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tahunTerbit">Tahun Terbit:</label>
          <input
            type="number"
            id="tahunTerbit"
            className="form-control"
            value={tahunTerbit}
            onChange={(e) => setTahunTerbit(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="penerbit">Penerbit:</label>
          <input
            type="text"
            id="penerbit"
            className="form-control"
            value={penerbit}
            onChange={(e) => setPenerbit(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="stok">Stok:</label>
          <input
            type="number"
            id="stok"
            className="form-control"
            value={stok}
            onChange={(e) => setStok(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="detail">Detail:</label>
          <textarea
            id="detail"
            className="form-control"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows="4"
          ></textarea>
        </div>
        <button type="submit" className="button primary">
          Simpan Buku
        </button>
      </form>
    </div>
  );
};

export default AddBookPage;