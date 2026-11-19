import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Compass,
  BookMarked,
  Clock,
  History,
  Bell,
  User,
  LogOut,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useLibrary } from '../context/libraryContext';
import BookCartDrawer from '../components/loans/bookCartDrawer';

export default function UserLayout() {
  const { currentUser, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { notifications } = useLibrary();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.user_id === currentUser?.id && !n.is_read
  ).length;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard User', icon: LayoutDashboard },
    { to: '/books', label: 'Katalog Buku', icon: Compass },
    { to: '/my-loans', label: 'Buku yang Dipinjam', icon: BookMarked },
    { to: '/my-requests', label: 'Permintaan Peminjaman', icon: Clock },
    { to: '/history', label: 'Riwayat Transaksi', icon: History },
    { to: '/notifications', label: 'Notifikasi', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'Profil Pengguna', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#A0E9FF] bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#CDF5FD] px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo-unipma.png"
              alt="Logo UNIPUS"
              className="h-9 w-9 object-contain"
            />
            <div>
              <span className="text-lg font-extrabold text-slate-900">
                Uni<span className="text-[#00A9FF]">pus</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#0088CC]">
                Member Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 mt-4 rounded-2xl border border-[#89CFF3] bg-gradient-to-br from-[#CDF5FD]/80 to-white p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A9FF] text-sm font-extrabold text-white shadow-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-slate-900">
                {currentUser?.name}
              </p>
              <p className="truncate text-[11px] font-medium text-[#0088CC]">
                {currentUser?.member_id || 'Anggota Aktif'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#00A9FF] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-[#CDF5FD]/60 hover:text-slate-900'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Keluar dari Akun
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#A0E9FF]/60 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Selamat datang kembali, <strong className="text-slate-900">{currentUser?.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCart}
              className="inline-flex items-center gap-2 rounded-xl border border-[#89CFF3] bg-[#CDF5FD]/70 px-3.5 py-2 text-xs font-bold text-[#0088CC] transition-all hover:bg-[#A0E9FF]"
            >
              <ShoppingBag className="h-4 w-4 text-[#00A9FF]" />
              <span>Book Cart</span>
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#00A9FF] px-1.5 text-[11px] font-extrabold text-white">
                {cartCount}
              </span>
            </button>

            <Link
              to="/notifications"
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-[#89CFF3] hover:text-[#00A9FF]"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <BookCartDrawer />
    </div>
  );
}
