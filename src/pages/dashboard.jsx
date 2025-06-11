// src/pages/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { API_URL } from '../constant';
import { API_ENDPOINTS } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const [petugasNama, setPetugasNama] = useState('Petugas');
  const [borrowData, setBorrowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeBorrows: 0,
    returnedBorrows: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const petugasData = localStorage.getItem('petugas');
    if (petugasData) {
      try {
        const petugas = JSON.parse(petugasData);
        if (petugas?.nama) setPetugasNama(petugas.nama);
      } catch (e) {
        console.error("Failed to parse petugas data", e);
      }
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [borrowsRes, booksRes, membersRes] = await Promise.all([
        axios.get(`${API_URL}/peminjaman`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/buku`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/member`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const borrowsData = borrowsRes.data.data || borrowsRes.data || [];
      setBorrowData(borrowsData);

      setStats({
        totalBooks: booksRes.data.length,
        totalMembers: membersRes.data.length,
        activeBorrows: borrowsData.filter(b => b.status_pengembalian === 0).length,
        returnedBorrows: borrowsData.filter(b => b.status_pengembalian === 1).length
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyBorrowData = () => {
    const monthlyData = Array(12).fill(0);
    const returnedData = Array(12).fill(0);
    
    borrowData.forEach(borrow => {
      const month = new Date(borrow.tgl_pinjam).getMonth();
      monthlyData[month]++;
      
      if (borrow.status_pengembalian === 1 && borrow.tgl_dikembalikan) {
        const returnMonth = new Date(borrow.tgl_dikembalikan).getMonth();
        returnedData[returnMonth]++;
      }
    });

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Peminjaman',
          data: monthlyData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
          label: 'Pengembalian',
          data: returnedData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
      ],
    };
  };

  const getStatusData = () => {
    return {
      labels: ['Dipinjam', 'Dikembalikan'],
      datasets: [
        {
          data: [stats.activeBorrows, stats.returnedBorrows],
          backgroundColor: [
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Statistik Peminjaman',
      },
    },
  };

  return (
    <div className="page-container dashboard-container">
      <h1 className="main-title">Selamat Datang, {petugasNama}!</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Total Buku</h3>
          <p>{stats.totalBooks}</p>
        </div>
        <div className="stat-card success">
          <h3>Total Member</h3>
          <p>{stats.totalMembers}</p>
        </div>
        <div className="stat-card warning">
          <h3>Sedang Dipinjam</h3>
          <p>{stats.activeBorrows}</p>
        </div>
        <div className="stat-card info">
          <h3>Telah Dikembalikan</h3>
          <p>{stats.returnedBorrows}</p>
        </div>
      </div>

      {/* Charts Section */}
      <section className="charts-section">
        <div className="chart-container">
          <h2 className="section-title">Peminjaman & Pengembalian Bulanan</h2>
          <div className="chart-wrapper">
            <Bar data={getMonthlyBorrowData()} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-container">
          <h2 className="section-title">Status Peminjaman</h2>
          <div className="chart-wrapper pie-chart">
            <Pie data={getStatusData()} options={chartOptions} />
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2 className="section-title">Aksi Cepat</h2>
        <div className="action-buttons">
          <Link to="/transactions/borrow" className="button success large">
            <i className="fas fa-plus-circle"></i> Pinjam Buku Baru
          </Link>
          <Link to="/members/add" className="button primary large">
            <i className="fas fa-user-plus"></i> Tambah Member Baru
          </Link>
          <Link to="/books/add" className="button secondary large">
            <i className="fas fa-book-medical"></i> Tambah Buku Baru
          </Link>
        </div>
      </section>

      {/* CSS Styles */}
      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
        }
        
        .main-title {
          color: #2c3e50;
          margin-bottom: 2rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          padding: 1.5rem;
          border-radius: 8px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .stat-card h3 {
          margin-top: 0;
          font-size: 1.1rem;
        }
        
        .stat-card p {
          font-size: 2rem;
          font-weight: bold;
          margin: 0.5rem 0 0;
        }
        
        .stat-card.primary { background-color: #3498db; }
        .stat-card.success { background-color: #2ecc71; }
        .stat-card.warning { background-color: #f39c12; }
        .stat-card.info { background-color: #1abc9c; }
        
        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .chart-container {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .chart-wrapper {
          height: 300px;
          margin-top: 1rem;
        }
        
        .pie-chart {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .section-title {
          color: #34495e;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }
        
        .quick-actions-section {
          margin-top: 3rem;
        }
        
        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;