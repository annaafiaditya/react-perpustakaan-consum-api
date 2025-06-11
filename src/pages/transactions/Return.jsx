import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";


export default function Return({ borrow, onClose, onReturned }) {
  const [error, setError] = useState("");
  const [denda, setDenda] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!borrow) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tglPengembalian = new Date(borrow.tgl_pengembalian);
    tglPengembalian.setHours(0, 0, 0, 0);
    const terlambat = tglPengembalian < today;
    const selisih = Math.floor((today - tglPengembalian) / (1000 * 60 * 60 * 24));
    if (terlambat) {
      const jumlahDenda = 2000 * selisih;
      setDenda({
        jumlah_denda: jumlahDenda.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
        deskripsi: `Pengembalian terlambat ${selisih} hari`,
        jenis_denda: "terlambat",
        id_member: borrow.id_member,
        id_buku: borrow.id_buku,
      });
    }
  }, [borrow]);

  function handleReturn(e) {
    e.preventDefault();
    if (!borrow) return;
    axios
      .put(
        `${API_URL}/peminjaman/pengembalian/${borrow.id}`,
        { ...borrow, status_pengembalian: 1 },
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        if (denda) {
          return axios.post(`${API_URL}/denda`, denda, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          });
        }
      })
      .then(() => {
        onReturned();
        onClose();
      })
      .catch(() => setError("Gagal mengembalikan buku."));
  }

  if (!borrow) return null;

  return (
    <form onSubmit={handleReturn} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <p>
        Apakah kamu yakin mengembalikan buku <strong>{borrow.judul || "-"}</strong> yang dipinjam oleh{" "}
        <strong>{borrow.nama_member || "-"}</strong>?
      </p>
      {denda && (
        <div className="p-2 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700 font-semibold">Ada denda keterlambatan!</p>
          <p>Jumlah denda: {denda.jumlah_denda}</p>
          <p>Deskripsi: {denda.deskripsi}</p>
        </div>
      )}
      <div className="flex space-x-2">
        <button type="submit" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
          Konfirmasi Pengembalian
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
