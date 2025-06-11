import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Peminjaman() {
  const [borrows, setBorrows] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [fines, setFines] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPengembalian, setIsModalPengembalian] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
  const [isModalDenda, setIsModalDenda] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [isLate, setIsLate] = useState(false);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineType, setFineType] = useState("terlambat");
  const [fineDescription, setFineDescription] = useState("");

  const [form, setForm] = useState({
    id_member: "",
    id_buku: "",
    tgl_pinjam: "",
    tgl_pengembalian: "",
    status: "Dipinjam",
    status_pengembalian: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
    fetchMembers();
    fetchBooks();
    fetchFines();
  }, []);

  useEffect(() => {
    if (selectedBorrow) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(selectedBorrow.tgl_pengembalian);
      dueDate.setHours(0, 0, 0, 0);
      
      const returnDateObj = returnDate ? new Date(returnDate) : today;
      returnDateObj.setHours(0, 0, 0, 0);
      
      setIsLate(returnDateObj > dueDate);
      
      if (returnDateObj > dueDate) {
        const diffTime = returnDateObj - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFineAmount(diffDays * 1000);
      } else {
        setFineAmount(0);
      }
    }
  }, [selectedBorrow, returnDate]);

  const filteredBorrows = borrows.filter((borrow) => {
    const member = members.find((m) => m.id === borrow.id_member);
    const book = books.find((b) => b.id === borrow.id_buku);
    const memberName = member?.nama?.toLowerCase() || "";
    const bookTitle = book?.judul?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return (
      memberName.includes(search) ||
      bookTitle.includes(search) ||
      borrow.tgl_pinjam.includes(search) ||
      borrow.tgl_pengembalian.includes(search) ||
      (borrow.status_pengembalian === 0
        ? "dipinjam".includes(search)
        : "dikembalikan".includes(search))
    );
  });

  const totalItems = filteredBorrows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBorrows = filteredBorrows.slice(indexOfFirstItem, indexOfLastItem);

  function fetchData() {
    axios
      .get(`${API_URL}/peminjaman`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setBorrows(data);
      })
      .catch(() => setError("Gagal mengambil data peminjaman."));
  }

  function fetchMembers() {
    axios
      .get(`${API_URL}/member`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setMembers(res.data))
      .catch(() => setError("Gagal mengambil data member."));
  }

  function fetchBooks() {
    axios
      .get(`${API_URL}/buku`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setBooks(res.data))
      .catch(() => setError("Gagal mengambil data buku."));
  }

  function fetchFines() {
    axios
      .get(`${API_URL}/denda`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setFines(data);
      })
      .catch(() => setError("Gagal mengambil data denda."));
  }

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post(`${API_URL}/peminjaman`, form, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchData();
        setIsModalOpen(false);
        setForm({
          id_member: "",
          id_buku: "",
          tgl_pinjam: "",
          tgl_pengembalian: "",
          status: "Dipinjam",
          status_pengembalian: 0,
        });
      })
      .catch(() => setError("Gagal melakukan peminjaman."));
  }

  function handlePengembalian(e) {
    e.preventDefault();
    const updatedBorrow = { 
      ...selectedBorrow, 
      status_pengembalian: 1,
      tgl_dikembalikan: returnDate || new Date().toISOString().split('T')[0]
    };
    
    axios
      .put(`${API_URL}/peminjaman/pengembalian/${selectedBorrow.id}`, updatedBorrow, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        if (isLate && fineAmount > 0) {
          setIsModalPengembalian(false);
          setIsModalDenda(true);
        } else {
          afterSubmit();
        }
      })
      .catch(() => setError("Gagal menyimpan pengembalian."));
  }

  function handleFineSubmit(e) {
    e.preventDefault();
    const fineData = {
      id_member: selectedBorrow.id_member,
      id_buku: selectedBorrow.id_buku,
      id_peminjaman: selectedBorrow.id,
      jumlah_denda: fineAmount,
      jenis_denda: fineType,
      deskripsi: fineDescription || `Denda keterlambatan pengembalian buku`,
    };

    axios
      .post(`${API_URL}/denda`, fineData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        fetchFines();
        afterSubmit();
      })
      .catch(() => setError("Gagal menyimpan data denda."));
  }

  function afterSubmit() {
    fetchData();
    setIsModalPengembalian(false);
    setIsModalDenda(false);
    setSelectedBorrow(null);
    setReturnDate("");
    setFineAmount(0);
    setFineType("terlambat");
    setFineDescription("");
  }

  function showDetail(borrow) {
    setSelectedBorrow(borrow);
    setIsModalDetail(true);
  }

  function exportExcel() {
    const formattedData = filteredBorrows.map((borrow, index) => {
      const borrowFines = fines.filter(f => f.id_peminjaman === borrow.id);
      const totalFine = borrowFines.reduce((sum, fine) => sum + fine.jumlah_denda, 0);
      
      return {
        No: index + 1,
        Nama: members.find((m) => m.id === borrow.id_member)?.nama || "-",
        Judul: books.find((b) => b.id === borrow.id_buku)?.judul || "-",
        Tgl_Pinjam: borrow.tgl_pinjam,
        Tgl_Pengembalian: borrow.tgl_pengembalian,
        Tgl_Dikembalikan: borrow.tgl_dikembalikan || "-",
        Status: borrow.status_pengembalian === 0 ? "Dipinjam" : "Dikembalikan",
        Denda: totalFine,
        Status_Denda: borrowFines.length > 0 ? 
          (borrowFines.every(f => f.deleted_at) ? "Lunas" : "Belum Lunas") : "Tidak Ada",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "data_peminjaman.xlsx");
  }

  function renderPaginationButtons() {
    const buttons = [];
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, totalPages);

    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    buttons.push(
      <button
        key="first"
        className="btn btn-sm mx-1 btn-outline-primary"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
      >
        First
      </button>
    );

    buttons.push(
      <button
        key="prev"
        className="btn btn-sm mx-1 btn-outline-primary"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`btn btn-sm mx-1 ${currentPage === i ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setCurrentPage(i)}
          aria-current={currentPage === i ? "page" : undefined}
        >
          {i}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        className="btn btn-sm mx-1 btn-outline-primary"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    buttons.push(
      <button
        key="last"
        className="btn btn-sm mx-1 btn-outline-primary"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last »
      </button>
    );

    return buttons;
  }

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  function handlePayFine(id) {
    if (window.confirm("Apakah Anda yakin ingin menandai denda ini sebagai lunas?")) {
      axios
        .delete(`${API_URL}/denda/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          fetchFines();
        })
        .catch(() => setError("Gagal memperbarui status denda."));
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-primary fw-bold">Data Peminjaman</h1>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <button onClick={exportExcel} className="btn btn-success px-4 fw-semibold">
          Export Excel
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary px-4 fw-semibold"
        >
          Tambah Peminjaman
        </button>
      </div>

      <div className="mb-3">
        <input
          type="search"
          className="form-control form-control-lg"
          placeholder="Cari nama member, judul buku, tanggal, atau status..."
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Cari peminjaman"
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th>Nama</th>
              <th>Buku</th>
              <th>Tgl Pinjam</th>
              <th>Tgl Kembali</th>
              <th style={{ width: "110px" }}>Status</th>
              <th>Denda</th>
              <th style={{ width: "140px" }} className="text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBorrows.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              currentBorrows.map((borrow, idx) => {
                const borrowFines = fines.filter(f => f.id_peminjaman === borrow.id);
                const totalFine = borrowFines.reduce((sum, fine) => sum + fine.jumlah_denda, 0);
                
                return (
                  <tr 
                    key={borrow.id} 
                    onClick={() => showDetail(borrow)}
                    style={{ cursor: "pointer" }}
                    className="hover-row"
                  >
                    <td>{indexOfFirstItem + idx + 1}</td>
                    <td>{members.find((m) => m.id === borrow.id_member)?.nama || "-"}</td>
                    <td>{books.find((b) => b.id === borrow.id_buku)?.judul || "-"}</td>
                    <td>{borrow.tgl_pinjam}</td>
                    <td>{borrow.tgl_pengembalian}</td>
                    <td>
                      {borrow.status_pengembalian === 0 ? (
                        <span className="badge bg-warning text-dark">Dipinjam</span>
                      ) : (
                        <span className="badge bg-success">Dikembalikan</span>
                      )}
                    </td>
                    <td>
                      {borrow.status_pengembalian === 1 ? (
                        totalFine > 0 ? (
                          <span className="badge bg-danger">
                            Rp {totalFine.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted">Tidak ada</span>
                        )
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-center">
                      {borrow.status_pengembalian === 0 && (
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBorrow(borrow);
                            setIsModalPengembalian(true);
                          }}
                          aria-label={`Pengembalian buku ${books.find((b) => b.id === borrow.id_buku)?.judul || ""}`}
                        >
                          Kembali
                        </button>
                      )}
                      <p>click untuk detail</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3">
        <div className="text-muted">
          Menampilkan{" "}
          <strong>
            {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, totalItems)}
          </strong>{" "}
          dari <strong>{totalItems}</strong> peminjaman
        </div>
        <div>{renderPaginationButtons()}</div>  
      </div>

      {/* Modal Tambah Peminjaman */}
      <div
        className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: isModalOpen ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        aria-modal={isModalOpen ? "true" : undefined}
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Tambah Peminjaman</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Tutup modal"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="member" className="form-label">
                    Member
                  </label>
                  <select
                    id="member"
                    className="form-select"
                    required
                    value={form.id_member}
                    onChange={(e) => setForm({ ...form, id_member: e.target.value })}
                  >
                    <option value="">-- Pilih Member --</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="buku" className="form-label">
                    Buku
                  </label>
                  <select
                    id="buku"
                    className="form-select"
                    required
                    value={form.id_buku}
                    onChange={(e) => setForm({ ...form, id_buku: e.target.value })}
                  >
                    <option value="">-- Pilih Buku --</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.judul}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="tglPinjam" className="form-label">
                    Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    id="tglPinjam"
                    className="form-control"
                    required
                    value={form.tgl_pinjam}
                    onChange={(e) => setForm({ ...form, tgl_pinjam: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="tglPengembalian" className="form-label">
                    Tanggal Pengembalian
                  </label>
                  <input
                    type="date"
                    id="tglPengembalian"
                    className="form-control"
                    required
                    value={form.tgl_pengembalian}
                    onChange={(e) => setForm({ ...form, tgl_pengembalian: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Tutup
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Pengembalian */}
      <div
        className={`modal fade ${isModalPengembalian ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: isModalPengembalian ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        aria-modal={isModalPengembalian ? "true" : undefined}
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            {selectedBorrow && (
              <form onSubmit={handlePengembalian}>
                <div className="modal-header">
                  <h5 className="modal-title">Pengembalian Buku</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalPengembalian(false)}
                    aria-label="Tutup modal"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Apakah Anda yakin ingin mengembalikan buku{" "}
                    <strong>
                      {books.find((b) => b.id === selectedBorrow.id_buku)?.judul}
                    </strong>{" "}
                    yang dipinjam oleh{" "}
                    <strong>
                      {members.find((m) => m.id === selectedBorrow.id_member)?.nama}
                    </strong>
                    ?
                  </p>

                  <div className="mb-3">
                    <label htmlFor="returnDate" className="form-label">
                      Tanggal Pengembalian Aktual
                    </label>
                    <input
                      type="date"
                      id="returnDate"
                      className="form-control"
                      value={returnDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>

                  {isLate && (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Buku dikembalikan terlambat. Akan dikenakan denda sebesar Rp {fineAmount.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalPengembalian(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-success">
                    Konfirmasi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal Denda */}
      <div
        className={`modal fade ${isModalDenda ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: isModalDenda ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        aria-modal={isModalDenda ? "true" : undefined}
        role="dialog"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            {selectedBorrow && (
              <form onSubmit={handleFineSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Denda Keterlambatan</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalDenda(false)}
                    aria-label="Tutup modal"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Member</label>
                    <input
                      type="text"
                      className="form-control"
                      value={members.find((m) => m.id === selectedBorrow.id_member)?.nama || "-"}
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Buku</label>
                    <input
                      type="text"
                      className="form-control"
                      value={books.find((b) => b.id === selectedBorrow.id_buku)?.judul || "-"}
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jumlah Denda</label>
                    <div className="input-group">
                      <span className="input-group-text">Rp</span>
                      <input
                        type="number"
                        className="form-control"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jenis Denda</label>
                    <select
                      className="form-select"
                      value={fineType}
                      onChange={(e) => setFineType(e.target.value)}
                    >
                      <option value="terlambat">Terlambat</option>
                      <option value="kerusakan">Kerusakan</option>
                      <option value="hilang">Hilang</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Deskripsi</label>
                    <textarea
                      className="form-control"
                      value={fineDescription}
                      onChange={(e) => setFineDescription(e.target.value)}
                      placeholder="Keterangan denda"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalDenda(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Simpan Denda
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      <div
        className={`modal fade ${isModalDetail ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: isModalDetail ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        aria-modal={isModalDetail ? "true" : undefined}
        role="dialog"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {selectedBorrow && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">Detail Peminjaman</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalDetail(false)}
                    aria-label="Tutup modal"
                  ></button>
                </div>
                <div className="modal-body">
                  <dl className="row">
                    <dt className="col-sm-4">Nama Member</dt>
                    <dd className="col-sm-8">
                      {members.find((m) => m.id === selectedBorrow.id_member)?.nama || "-"}
                    </dd>

                    <dt className="col-sm-4">Judul Buku</dt>
                    <dd className="col-sm-8">
                      {books.find((b) => b.id === selectedBorrow.id_buku)?.judul || "-"}
                    </dd>

                    <dt className="col-sm-4">Tanggal Pinjam</dt>
                    <dd className="col-sm-8">{selectedBorrow.tgl_pinjam}</dd>

                    <dt className="col-sm-4">Tanggal Pengembalian</dt>
                    <dd className="col-sm-8">{selectedBorrow.tgl_pengembalian}</dd>

                    {selectedBorrow.tgl_dikembalikan && (
                      <>
                        <dt className="col-sm-4">Tanggal Dikembalikan</dt>
                        <dd className="col-sm-8">{selectedBorrow.tgl_dikembalikan}</dd>
                      </>
                    )}

                    <dt className="col-sm-4">Status</dt>
                    <dd className="col-sm-8">
                      {selectedBorrow.status_pengembalian === 0
                        ? "Dipinjam"
                        : "Dikembalikan"}
                    </dd>

                    <dt className="col-sm-4">Total Denda</dt>
                    <dd className="col-sm-8">
                      {fines.filter(f => f.id_peminjaman === selectedBorrow.id).length > 0 ? (
                        <strong className="text-danger">
                          Rp {fines
                            .filter(f => f.id_peminjaman === selectedBorrow.id)
                            .reduce((sum, fine) => sum + fine.jumlah_denda, 0)
                            .toLocaleString()}
                        </strong>
                      ) : (
                        <span className="text-muted">Tidak ada denda</span>
                      )}
                    </dd>

                    {selectedBorrow.status_pengembalian === 1 && (
                      <>
                        <dt className="col-sm-4">Detail Denda</dt>
                        <dd className="col-sm-8">
                          <div className="table-responsive mt-2">
                            <table className="table table-sm table-bordered">
                              <thead className="table-light">
                                <tr>
                                  <th>Jenis Denda</th>
                                  <th>Jumlah</th>
                                  <th>Deskripsi</th>
                                  <th>Status</th>
                                  <th>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {fines.filter(f => f.id_peminjaman === selectedBorrow.id).length > 0 ? (
                                  fines.filter(f => f.id_peminjaman === selectedBorrow.id).map(fine => (
                                    <tr key={fine.id}>
                                      <td>{fine.jenis_denda}</td>
                                      <td>Rp {fine.jumlah_denda.toLocaleString()}</td>
                                      <td>{fine.deskripsi || '-'}</td>
                                      <td>
                                        {fine.deleted_at ? (
                                          <span className="badge bg-success">Lunas</span>
                                        ) : (
                                          <span className="badge bg-warning">Belum Lunas</span>
                                        )}
                                      </td>
                                      <td>
                                        {!fine.deleted_at && (
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handlePayFine(fine.id);
                                            }}
                                          >
                                            Bayar
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="text-center text-muted">
                                      Tidak ada data denda
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </dd>
                      </>
                    )}
                  </dl>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalDetail(false)}
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-row:hover {
          background-color: #f8f9fa;
          transform: scale(1.005);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}