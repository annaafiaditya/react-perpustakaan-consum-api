import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const MembersPage = () => {
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State untuk filtering, sorting, dan pagination LOKAL
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');

  const fetchAllMembers = useCallback(async () => {
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
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.MEMBERS}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      console.log('API Response (ALL Members):', data);

      if (Array.isArray(data)) {
        setAllMembers(data);
      } else if (data && Array.isArray(data.data)) {
        setAllMembers(data.data);
      } else {
        setError('Format data member tidak valid dari server (bukan array).');
        setAllMembers([]);
      }
    } catch (err) {
      console.error('Error fetching all members:', err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat semua data member.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchAllMembers();
  }, [fetchAllMembers]);

  const processedMembers = useMemo(() => {
    let filtered = allMembers;

    if (searchQuery) {
      const lowerCaseSearch = searchQuery.toLowerCase();
      filtered = allMembers.filter(member =>
        (member.nama && member.nama.toLowerCase().includes(lowerCaseSearch)) ||
        (member.no_ktp && String(member.no_ktp).toLowerCase().includes(lowerCaseSearch))
      );
    }

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === undefined || aValue === null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === undefined || bValue === null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });
  }, [allMembers, searchQuery, sortBy, sortOrder]);

  const totalItems = processedMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedMembers.slice(startIndex, endIndex);
  }, [processedMembers, currentPage, itemsPerPage]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus member ini?')) return;

    if (!token) {
      alert('Anda belum login atau sesi telah berakhir.');
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${API_URL}${API_ENDPOINTS.MEMBERS}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Member berhasil dihapus.');
      fetchAllMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert('Gagal menghapus member: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan.'));
      }
    }
  };

  const getSortIcon = (column) => {
    if (sortBy === column) return sortOrder === 'asc' ? ' ▲' : ' ▼';
    return '';
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    buttons.push(
      <button 
        key="first" 
        className={`btn btn-sm mx-1 ${currentPage === 1 ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        &laquo; First
      </button>
    );

    buttons.push(
      <button 
        key="prev" 
        className={`btn btn-sm mx-1 ${currentPage === 1 ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lsaquo; Prev
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${currentPage === i ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button 
        key="next" 
        className={`btn btn-sm mx-1 ${currentPage === totalPages ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &rsaquo;
      </button>
    );

    buttons.push(
      <button 
        key="last" 
        className={`btn btn-sm mx-1 ${currentPage === totalPages ? 'btn-outline-secondary disabled' : 'btn-outline-primary'}`}
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last &raquo;
      </button>
    );

    return buttons;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Memuat data member...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      );
    }
    
    if (currentMembers.length === 0) {
      return (
        <div className="alert alert-info">
          {searchQuery ? 'Tidak ada member yang sesuai dengan pencarian' : 'Tidak ada member ditemukan'}
        </div>
      );
    }

    return (
      <>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  ID{getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('no_ktp')} style={{ cursor: 'pointer' }}>
                  No KTP{getSortIcon('no_ktp')}
                </th>
                <th onClick={() => handleSort('nama')} style={{ cursor: 'pointer' }}>
                  Nama{getSortIcon('nama')}
                </th>
                <th onClick={() => handleSort('alamat')} style={{ cursor: 'pointer' }}>
                  Alamat{getSortIcon('alamat')}
                </th>
                <th onClick={() => handleSort('tgl_lahir')} style={{ cursor: 'pointer' }}>
                  Tgl Lahir{getSortIcon('tgl_lahir')}
                </th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.no_ktp || '-'}</td>
                  <td>{member.nama || '-'}</td>
                  <td>{member.alamat || '-'}</td>
                  <td>{member.tgl_lahir || '-'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/members/edit/${member.id}`} className="btn btn-sm btn-warning">
                        Edit
                      </Link>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(member.id)}
                      >
                        Hapus
                      </button>
                      <Link to={`/members/${member.id}`} className="btn btn-sm btn-info">
                        Riwayat
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} member
          </div>
          <div className="d-flex">
            {renderPaginationButtons()}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bold">Daftar Member</h1>
        <Link to="/members/add" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>Tambah Member
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Cari berdasarkan nama atau No KTP..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-primary w-100"
                onClick={() => setCurrentPage(1)}
              >
                <i className="bi bi-search me-2"></i>Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default MembersPage;