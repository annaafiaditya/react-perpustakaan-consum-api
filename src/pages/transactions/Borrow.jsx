import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../constant";

export default function Borrow({ onClose, onBorrowed }) {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    id_member: "",
    id_buku: "",
    tgl_pinjam: "",
    tgl_pengembalian: "",
    status: "Dipinjam",
    status_pengembalian: 0,
  });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${API_URL}/member`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      })
      .then((res) => setMembers(res.data))
      .catch(() => setError("Gagal mengambil data member."));

    axios
      .get(`${API_URL}/buku`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      })
      .then((res) => setBooks(res.data))
      .catch(() => setError("Gagal mengambil data buku."));
  }, [token]);

  function handleSubmit(e) {
    e.preventDefault();
    axios
      .post(`${API_URL}/peminjaman`, form, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      })
      .then(() => {
        onBorrowed();
        onClose();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>Member</label>
        <select
          value={form.id_member}
          onChange={(e) => setForm({ ...form, id_member: e.target.value })}
          required
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Pilih Member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nama}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Buku</label>
        <select
          value={form.id_buku}
          onChange={(e) => setForm({ ...form, id_buku: e.target.value })}
          required
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Pilih Buku</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.judul}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Tanggal Pinjam</label>
        <input
          type="date"
          value={form.tgl_pinjam}
          onChange={(e) => setForm({ ...form, tgl_pinjam: e.target.value })}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div>
        <label>Tanggal Pengembalian</label>
        <input
          type="date"
          value={form.tgl_pengembalian}
          onChange={(e) => setForm({ ...form, tgl_pengembalian: e.target.value })}
          required
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Simpan
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
