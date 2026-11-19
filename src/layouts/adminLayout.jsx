import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Tags,
  Users,
  Clock,
  BookCheck,
  RotateCcw,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useLibrary } from '../context/libraryContext';
import { LOAN_STATUS, NIM_STATUS } from '../utils/constants';

export default function AdminLayout() {
  const { currentUser, users, logout } = useAuth();
  const { loans } = useLibrary();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingCount = loans.filter((l) => l.status === LOAN_STATUS.PENDING).length;
  const returnReqCount = loans.filter(
    (l) => l.status === LOAN_STATUS.RETURN_REQUESTED
  ).length;
  const pendingNimCount = users.filter(
    (u) => u.nim_status === NIM_STATUS.PENDING
  ).length;

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
    { to: '/admin/books', label: 'Manajemen Buku', icon: Library },
    { to: '/admin/categories', label: 'Manajemen Kategori', icon: Tags },
    {
      to: '/admin/loan-requests',
      label: 'Permintaan Peminjaman',
      icon: Clock,
      badge: pendingCount,
    },
    { to: '/admin/active-loans', label: 'Peminjaman Aktif', icon: BookCheck },
    {
      to: '/admin/returns',
      label: 'Pengembalian Buku',
      icon: RotateCcw,
      badge: returnReqCount,
    },
    { to: '/admin/history', label: 'Riwayat Transaksi', icon: History },
    {
      to: '/admin/users',
      label: 'Pengguna & Verifikasi NIM',
      icon: Users,
      badge: pendingNimCount,
    },
    { to: '/admin/settings', label: 'Pengaturan Durasi', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo-unipma.png"
              alt="Logo UNIPUS"
              className="h-9 w-9 object-contain"
            />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Uni<span className="text-[#89CFF3]">pus</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A0E9FF]">
                Admin Backoffice
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Role Badge */}
        <div className="mx-4 mt-4 rounded-2xl border border-slate-800 bg-slate-800/70 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A9FF]/20 text-[#89CFF3]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{currentUser?.name}</p>
              <p className="truncate text-[11px] text-[#89CFF3]">Petugas Perpustakaan</p>
            </div>
          </div>
        </div>

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
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#A0E9FF] px-1.5 text-[10px] font-extrabold text-slate-900">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-950/50"
          >
            <LogOut className="h-4 w-4" />
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0088CC]">
              Panel Operasional Perpustakaan Unipus
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/books" className="btn-outline py-1.5 text-xs">
              Lihat Katalog Publik
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
