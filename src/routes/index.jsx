// src/routes/index.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';

// Public Page
import LoginPage from '../pages/login.jsx';

// Dashboard
import DashboardPage from '../pages/dashboard.jsx';

// Buku
import BooksPage from '../pages/buku/index.jsx';
import AddBookPage from '../pages/buku/Add.jsx';
import EditBookPage from '../pages/buku/Edit.jsx';

// Member
import MembersPage from '../pages/member/index.jsx';
import AddMemberPage from '../pages/member/Add.jsx';
import EditMemberPage from '../pages/member/Edit.jsx';
import MemberHistoryPage from '../pages/member/History';

// Transaksi
import TransactionsPage from '../pages/transactions/index.jsx';
import BorrowBookPage from '../pages/transactions/Borrow.jsx';
import TransactionDetailPage from '../pages/transactions/Detail.jsx';
import ReturnBookPage from '../pages/transactions/Return.jsx';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

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
          <Route path="/transactions/borrow" element={<BorrowBookPage />} />
          <Route path="/transactions/detail/:id" element={<TransactionDetailPage />} />
          <Route path="/transactions/return/:id" element={<ReturnBookPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
