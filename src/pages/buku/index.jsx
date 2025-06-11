import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../constant';
import { API_ENDPOINTS } from '../../services/api';

const BooksPage = () => {
  const [allBooks, setAllBooks] = useState([]); // Menyimpan semua buku dari API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State untuk filtering, sorting, dan pagination LOKAL
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed to 10 items per page

  const token = localStorage.getItem('token');

  // Hanya fetch SEMUA data buku SEKALI saat komponen dimuat
  const fetchAllBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      // Tidak ada parameter pagination, search, atau sort yang dikirim ke API
      const response = await axios.get(`${API_URL}${API_ENDPOINTS.BUKU}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      console.log('API Response (ALL Books):', data); // Log respons dari API

      // Pastikan data yang diterima adalah array
      if (Array.isArray(data)) {
        setAllBooks(data); // Simpan semua buku
      } else if (data && Array.isArray(data.data)) { // Jika backend ternyata kirim format paginated
        setAllBooks(data.data);
      } else {
        setError('Format data buku tidak valid dari server (bukan array).');
        setAllBooks([]);
      }
    } catch (err) {
      console.error('Error fetching all books:', err);
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memuat semua data buku.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchAllBooks(); // Panggil fetch semua buku hanya sekali saat mount
  }, [fetchAllBooks]);

  // Logika Filtering, Sorting, dan Pagination LOKAL
  const processedBooks = useMemo(() => {
    let filtered = allBooks;

    // 1. Filtering (Search)
    if (searchQuery) {
      const lowerCaseSearch = searchQuery.toLowerCase();
      filtered = allBooks.filter(book =>
        book.judul.toLowerCase().includes(lowerCaseSearch)
        // Tambahkan kolom lain jika ingin mencari di lebih dari satu kolom
        // || book.pengarang.toLowerCase().includes(lowerCaseSearch)
        // || book.penerbit.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 2. Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === undefined || bValue === undefined) return 0; // Handle missing properties

      // Basic comparison for numbers and strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [allBooks, searchQuery, sortBy, sortOrder]);

  // Logika Pagination LOKAL
  const totalItems = processedBooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedBooks.slice(startIndex, endIndex);
  }, [processedBooks, currentPage, itemsPerPage]);


  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search input
  };

  const handleSearchButtonClick = () => {
    // Karena filtering sudah terjadi di useMemo saat searchQuery berubah,
    // tombol ini hanya berfungsi untuk memicu perubahan searchQuery jika user mau.
    // Jika user mengetik lalu klik tombol, setSearchQuery sudah dipanggil.
    // Ini lebih ke indikator "submit"
    // Cukup pastikan currentPage sudah 1.
    setCurrentPage(1);
    // Tidak perlu panggil fetchBooks lagi karena data sudah ada di allBooks
  };


  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus buku ini?')) return;

    if (!token) {
      alert('Anda belum login atau sesi telah berakhir.');
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`${API_URL}${API_ENDPOINTS.BUKU}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Buku berhasil dihapus.');
      fetchAllBooks(); // Panggil ulang untuk memuat semua data lagi
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Sesi Anda berakhir. Silakan login kembali.');
        localStorage.clear();
        navigate('/login');
      } else {
        alert('Gagal menghapus buku: ' + (err.response?.data?.message || err.message || 'Terjadi kesalahan.'));
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
      <button key="first" className="pagination-button" onClick={() => handlePageChange(1)} disabled={currentPage === 1 || totalPages === 0}>
        &laquo; First
      </button>
    );

    buttons.push(
      <button key="prev" className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || totalPages === 0}>
        &lsaquo; Prev
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
          disabled={loading || totalPages === 0}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button key="next" className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
        Next &rsaquo;
      </button>
    );

    buttons.push(
      <button key="last" className="pagination-button" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
        Last &raquo;
      </button>
    );

    return buttons;
  };

  const renderContent = () => {
    if (loading) { // Loading state for initial fetch
      return <p className="loading-message">Memuat data buku...</p>;
    }
    if (error) { // Error state
      return <p className="error-message">Error: {error}</p>;
    }
    if (currentBooks.length === 0 && totalItems === 0) { // No books found after filtering/initial load
      return <p className="no-data-message">Tidak ada buku ditemukan.</p>;
    }
    if (currentBooks.length === 0 && totalItems > 0) { // No books on current page, but some exist overall (e.g. search led to empty page)
        return <p className="no-data-message">Tidak ada buku di halaman ini dengan kriteria pencarian/filter yang diberikan.</p>;
    }


    return (
      <>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID{getSortIcon('id')}</th>
                <th onClick={() => handleSort('no_rak')}>No Rak{getSortIcon('no_rak')}</th>
                <th onClick={() => handleSort('judul')}>Judul{getSortIcon('judul')}</th>
                <th onClick={() => handleSort('pengarang')}>Pengarang{getSortIcon('pengarang')}</th>
                <th onClick={() => handleSort('tahun_terbit')}>Tahun Terbit{getSortIcon('tahun_terbit')}</th>
                <th onClick={() => handleSort('penerbit')}>Penerbit{getSortIcon('penerbit')}</th>
                <th onClick={() => handleSort('stok')}>Stok{getSortIcon('stok')}</th>
                <th>Detail</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map(book => (
                <tr key={book.id}>
                  <td>{book.id}</td>
                  <td>{book.no_rak}</td>
                  <td>{book.judul}</td>
                  <td>{book.pengarang}</td>
                  <td>{book.tahun_terbit}</td>
                  <td>{book.penerbit}</td>
                  <td>{book.stok}</td>
                  <td>{book.detail}</td>
                  <td className="action-buttons-cell">
                    <Link to={`/books/edit/${book.id}`} className="button small secondary">Edit</Link>
                    <button className="button small danger" onClick={() => handleDelete(book.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls">
          <div className="pagination-info">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} buku
          </div>
          <div className="pagination-buttons">
            {renderPaginationButtons()}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1 className="page-title">Daftar Buku</h1>
        <Link to="/books/add" className="button primary">+ Tambah Buku</Link>
      </div>

      <div className="filter-controls">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Cari judul..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearchButtonClick();
            }
          }}
        />
        <button type="button" className="button primary" onClick={handleSearchButtonClick}>
          Cari
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default BooksPage;