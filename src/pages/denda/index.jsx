import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DendaPage() {
    const [fines, setFines] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 10;

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchFines();
        fetchMembers();
        fetchBooks();
    }, []);

    const fetchFines = () => {
        axios
            .get(`${API_URL}/denda`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : (res.data.data ? res.data.data : []);
                setFines(data);
            })
            .catch((error) => {
                console.error("Error fetching fines:", error);
                setError("Gagal mengambil data denda.");
            });
    };

    const fetchMembers = () => {
        axios
            .get(`${API_URL}/member`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setMembers(res.data))
            .catch(() => setError("Gagal mengambil data member."));
    };

    const fetchBooks = () => {
        axios
            .get(`${API_URL}/buku`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setBooks(res.data))
            .catch(() => setError("Gagal mengambil data buku."));
    };

    const exportExcel = () => {
        const finesData = fines.map((fine) => {
            const member = members.find((m) => m.id === fine.id_member);
            const book = books.find((b) => b.id === fine.id_buku);
            return {
                "ID Denda": fine.id,
                "Nama Member": member?.nama || "-",
                "Judul Buku": book?.judul || "-",
                "Jumlah Denda": `Rp ${fine.jumlah_denda}`,
                "Jenis Denda": fine.jenis_denda,
                "Deskripsi": fine.deskripsi,
                "Tanggal Dibuat": new Date(fine.created_at).toLocaleDateString("id-ID"),
            };
        });

        const ws = XLSX.utils.json_to_sheet(finesData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Denda");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, "data_denda.xlsx");
    };

    const filteredFines = fines.filter((fine) => {
        const member = members.find((m) => m.id === fine.id_member);
        const book = books.find((b) => b.id === fine.id_buku);
        const memberName = member?.nama?.toLowerCase() || "";
        const bookTitle = book?.judul?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return (
            memberName.includes(search) ||
            bookTitle.includes(search) ||
            fine.jenis_denda.toLowerCase().includes(search)
        );
    });

    const totalItems = filteredFines.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFines = filteredFines.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manajemen Denda</h1>
                <button
                    onClick={exportExcel}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Export Excel
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari denda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Buku
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jumlah Denda
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jenis Denda
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentFines.map((fine) => {
                            const member = members.find((m) => m.id === fine.id_member);
                            const book = books.find((b) => b.id === fine.id_buku);
                            return (
                                <tr key={fine.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{member?.nama || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{book?.judul || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">Rp {fine.jumlah_denda}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{fine.jenis_denda}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(fine.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === page
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    );
} 