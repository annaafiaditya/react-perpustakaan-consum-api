// src/pages/buku/Edit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const EditBookPage = () => {
  const { id } = useParams();
  const [noRak, setNoRak] = useState('');
  const [judul, setJudul] = useState('');
  const [pengarang, setPengarang] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [stok, setStok] = useState('');
  const [detail, setDetail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}${API_ENDPOINTS.BUKU}/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const bookData = response.data;
        // Set all book data fields
        setNoRak(bookData.no_rak || '');
        setJudul(bookData.judul || '');
        setPengarang(bookData.pengarang || '');
        setTahunTerbit(bookData.tahun_terbit || '');
        setPenerbit(bookData.penerbit || '');
        setStok(bookData.stok || '');
        setDetail(bookData.detail || '');
      } catch (err) {
        console.error('Error fetching book details:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('petugas');
          navigate('/login');
        } else {
          setError('Gagal mengambil detail buku. ' + (err.response?.data?.message || err.message));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

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
      await axios.put(`${API_URL}${API_ENDPOINTS.BUKU}/${id}`, {
        no_rak: noRak,
        judul,
        pengarang,
        tahun_terbit: tahunTerbit,
        penerbit,
        stok: stok,
        detail,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/books'), 1500); // Redirect setelah 1.5 detik
    } catch (err) {
      console.error('Error updating book:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('petugas');
        navigate('/login');
      } else {
        setError('Gagal memperbarui buku. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <p className="loading-message">Memuat detail buku...</p>;
  if (error && !loading) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="page-container">
      <h1 className="page-title">Edit Buku</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Buku berhasil diperbarui!</p>}
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
          Update Buku
        </button>
      </form>
    </div>
  );
};

export default EditBookPage;