import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../utils/constants';
import ProtectedRoute from './protectedRoute';

// Layouts
import PublicLayout from '../layouts/publicLayout';
import UserLayout from '../layouts/userLayout';
import AdminLayout from '../layouts/adminLayout';

// Public Pages
import LandingPage from '../pages/public/landingPage';
import LoginPage from '../pages/public/loginPage';
import RegisterPage from '../pages/public/registerPage';
import CatalogPage from '../pages/public/catalogPage';
import BookDetailPage from '../pages/public/bookDetailPage';

// User Pages
import UserDashboardPage from '../pages/user/userDashboardPage';
import MyLoansPage from '../pages/user/myLoansPage';
import LoanRequestsPage from '../pages/user/loanRequestsPage';
import UserHistoryPage from '../pages/user/userHistoryPage';
import NotificationsPage from '../pages/user/notificationsPage';
import ProfilePage from '../pages/user/profilePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/adminDashboardPage';
import ManageBooksPage from '../pages/admin/manageBooksPage';
import ManageCategoriesPage from '../pages/admin/manageCategoriesPage';
import LoanRequestsAdminPage from '../pages/admin/loanRequestsAdminPage';
import ActiveLoansAdminPage from '../pages/admin/activeLoansAdminPage';
import ReturnConfirmPage from '../pages/admin/returnConfirmPage';
import AdminHistoryPage from '../pages/admin/adminHistoryPage';
import ManageUsersPage from '../pages/admin/manageUsersPage';
import LoanSettingsPage from '../pages/admin/loanSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id"
          element={
            <ProtectedRoute>
              <BookDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Protected User Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[ROLES.USER]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/my-loans" element={<MyLoansPage />} />
        <Route path="/my-requests" element={<LoanRequestsPage />} />
        <Route path="/history" element={<UserHistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Protected Admin & Petugas Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PETUGAS]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="books" element={<ManageBooksPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
        <Route path="loan-requests" element={<LoanRequestsAdminPage />} />
        <Route path="active-loans" element={<ActiveLoansAdminPage />} />
        <Route path="returns" element={<ReturnConfirmPage />} />
        <Route path="history" element={<AdminHistoryPage />} />
        <Route path="users" element={<ManageUsersPage />} />
        <Route path="settings" element={<LoanSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
