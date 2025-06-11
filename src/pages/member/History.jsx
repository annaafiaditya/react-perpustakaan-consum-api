import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✔ Import dengan benar
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const MemberHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const fetchMemberHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      alert('Sesi Anda berakhir. Silakan login kembali.');
      localStorage.clear();
      navigate('/login');
      return;
    }

    try {
      const memberResponse = await axios.get(`${API_URL}${API_ENDPOINTS.MEMBERS}/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const borrowResponse = await axios.get(`${API_URL}/peminjaman`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const allBorrows = Array.isArray(borrowResponse.data)
        ? borrowResponse.data
        : borrowResponse.data.data || [];

      const memberBorrows = allBorrows.filter((borrow) => borrow.id_member == id);

      setMember(memberResponse.data);
      setBorrowHistory(memberBorrows);
    } catch (err) {
      console.error('Error fetching member history:', err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Member tidak ditemukan.');
      } else {
        setError(err.response?.data?.message || 'Gagal memuat riwayat member.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchMemberHistory();
  }, [fetchMemberHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const exportToPDF = () => {
    console.log('Export PDF triggered');
    const doc = new jsPDF();
    doc.text(`Riwayat Peminjaman - ${member?.nama}`, 14, 15);

    const tableColumn = ['No', 'ID Transaksi', 'Tanggal Pinjam', 'Tanggal Kembali', 'Status', 'Denda'];
    const tableRows = [];

    borrowHistory.forEach((borrow, index) => {
      const returnDate =
        borrow.status_pengembalian === 1
          ? formatDate(borrow.tgl_dikembalikan)
          : formatDate(borrow.tgl_pengembalian) + ' (Batas)';

      const rowData = [
        index + 1,
        `TRX-${borrow.id.toString().padStart(4, '0')}`,
        formatDate(borrow.tgl_pinjam),
        returnDate,
        borrow.status_pengembalian === 1 ? 'Dikembalikan' : 'Dipinjam',
        borrow.denda > 0 ? formatCurrency(borrow.denda) : 'Tidak ada',
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`Riwayat_Peminjaman_${member?.nama || 'member'}.pdf`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bold">Riwayat Peminjaman Member</h1>
        <div>
          <button
            className="btn btn-outline-success me-2"
            onClick={exportToPDF}
            disabled={borrowHistory.length === 0}
          >
            Export PDF
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/members')}>
            Kembali ke Daftar Member
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat...</span>
          </div>
          <p className="mt-2">Memuat data member...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!loading && member && (
        <>
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Informasi Member</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>ID Member:</strong> {member.id}</p>
                  <p><strong>Nama:</strong> {member.nama}</p>
                  <p><strong>No. KTP:</strong> {member.no_ktp || '-'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Alamat:</strong> {member.alamat || '-'}</p>
                  <p><strong>Tanggal Lahir:</strong> {formatDate(member.tgl_lahir)}</p>
                  <p><strong>Total Peminjaman:</strong> {borrowHistory.length} kali</p>
                </div>
              </div>
            </div>
          </div>

          <h4 className="mb-3">Riwayat Peminjaman</h4>

          {borrowHistory.length === 0 ? (
            <div className="alert alert-info">
              Member ini belum pernah melakukan peminjaman.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>ID Transaksi</th>
                    <th>Tanggal Pinjam</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                    <th>Denda</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowHistory.map((borrow, index) => (
                    <tr key={borrow.id}>
                      <td>{index + 1}</td>
                      <td>TRX-{borrow.id.toString().padStart(4, '0')}</td>
                      <td>{formatDate(borrow.tgl_pinjam)}</td>
                      <td>
                        {borrow.status_pengembalian === 1
                          ? formatDate(borrow.tgl_dikembalikan)
                          : formatDate(borrow.tgl_pengembalian) + ' (Batas)'}
                      </td>
                      <td>
                        {borrow.status_pengembalian === 0 ? (
                          <span className="badge bg-warning">Dipinjam</span>
                        ) : (
                          <span className="badge bg-success">Dikembalikan</span>
                        )}
                      </td>
                      <td>
                        {borrow.denda > 0 ? (
                          <span className="badge bg-danger">{formatCurrency(borrow.denda)}</span>
                        ) : (
                          <span className="text-muted">Tidak ada</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => navigate(`/transactions/${borrow.id}`)}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberHistoryPage;
