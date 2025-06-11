import React from "react";

export default function Detail({ borrow, members, books, onClose }) {
  if (!borrow) return null;

  const member = members.find((m) => m.id === borrow.id_member);
  const book = books.find((b) => b.id === borrow.id_buku);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Detail Peminjaman</h2>
      <p>
        <strong>Nama Member:</strong> {member?.nama || "-"}
      </p>
      <p>
        <strong>Judul Buku:</strong> {book?.judul || "-"}
      </p>
      <p>
        <strong>Tanggal Pinjam:</strong> {borrow.tgl_pinjam || "-"}
      </p>
      <p>
        <strong>Tanggal Pengembalian:</strong> {borrow.tgl_pengembalian || "-"}
      </p>
      <p>
        <strong>Status:</strong> {borrow.status || "-"}
      </p>
      <button
        onClick={onClose}
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        Tutup
      </button>
    </div>
  );
}
