import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import DashboardPage from './pages/dashboard';
import Template from './layouts/Template';
import './App.css';

// Import halaman Buku
import BooksPage from './pages/buku';
import AddBookPage from './pages/buku/Add';
import EditBookPage from './pages/buku/Edit';

// Import halaman Member
import MembersPage from './pages/member';
import AddMemberPage from './pages/member/Add';
import EditMemberPage from './pages/member/Edit';
import MemberHistoryPage from './pages/member/History.jsx';

// Import halaman Transaksi
import TransactionsPage from './pages/transactions';
import TransactionDetailPage from './pages/transactions/Detail';
import BorrowBookPage from './pages/transactions/Borrow';
import ReturnBookPage from './pages/transactions/Return';

// Import halaman Denda
import DendaPage from './pages/denda';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Login (tidak dibungkus oleh PrivateRoute) */}
        <Route path="/login" element={<Login />} />

        {/* Rute Private */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Template>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Buku */}
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/add" element={<AddBookPage />} />
                  <Route path="/books/edit/:id" element={<EditBookPage />} />

                  {/* Member */}
                  <Route path="/members" element={<MembersPage />} />
                  <Route path="/members/add" element={<AddMemberPage />} />
                  <Route path="/members/edit/:id" element={<EditMemberPage />} />
                  <Route path="/members/:id" element={<MemberHistoryPage />} />

                  {/* Transaksi */}
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/transactions/detail/:id" element={<TransactionDetailPage />} />
                  <Route path="/transactions/borrow" element={<BorrowBookPage />} />
                  <Route path="/transactions/return/:id" element={<ReturnBookPage />} />

                  {/* Denda */}
                  <Route path="/denda" element={<DendaPage />} />

                  {/* Fallback untuk halaman yang tidak ditemukan */}
                  <Route path="*" element={<p>404 Not Found</p>} />
                </Routes>
              </Template>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
