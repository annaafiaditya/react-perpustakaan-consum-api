// src/services/api.js

export const API_ENDPOINTS = {
  // Autentikasi
  LOGIN: '/login',
  REGISTER: '/register', // Tambah jika perlu

  // Buku
  BUKU: '/buku',

  // Member
  MEMBERS: '/member', // Diperbaiki dari /members menjadi /member (sesuai ringkasan API)
  // Endpoint untuk riwayat member (asumsi API mengembalikan berdasarkan ID member)
  MEMBER_PEMINJAMAN_HISTORY: '/peminjaman', // GET /peminjaman/{id_member}

// Peminjaman (Transactions)
PEMINJAMAN: '/peminjaman', // GET All, POST Create
// Untuk detail satu peminjaman: GET /api/peminjaman/{id} (asumsi Laravel default)
// Untuk pengembalian: PUT /api/peminjaman/pengembalian/{id}
PENGEMBALIAN: '/peminjaman/pengembalian',

  // Denda (jika Anda memiliki halaman terpisah untuk denda)
  DENDA: '/denda', // GET /denda, POST /denda
  DENDA_BY_MEMBER: '/denda', // GET /denda/{id_member}

  // Statistik & Export (Jika API Anda menyediakan endpoint ini)
  STATISTIK_PEMINJAMAN_PER_BULAN: '/statistik/peminjaman-per-bulan', // Asumsi endpoint ini ada
  EXPORT_PEMINJAMAN_EXCEL: '/export/peminjaman/excel', // Asumsi endpoint ini ada
  EXPORT_MEMBER_HISTORY_PDF: '/export/members/:id/pdf', // Asumsi endpoint ini ada dan perlu penggantian :id
};