import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  Layers,
  Users,
  BookCheck,
  Clock,
  RotateCcw,
  ArrowRight,
  Activity,
  Eye,
} from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useAuth } from '../../context/authContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function AdminDashboardPage() {
  const { books, loans, activityLogs } = useLibrary();
  const { users } = useAuth();
  const [selectedLoan, setSelectedLoan] = useState(null);

  // 6 KPI Metrics matching PRD Section 6.6
  const totalBooks = books.length;
  const totalAvailableStock = books.reduce(
    (sum, b) => sum + Number(b.available_stock || 0),
    0
  );
  const totalRegisteredUsers = users.length;
  const totalActiveLoans = loans.filter(
    (l) =>
      l.status === LOAN_STATUS.BORROWED ||
      l.status === LOAN_STATUS.OVERDUE ||
      l.status === LOAN_STATUS.RETURN_REQUESTED
  ).length;
  const totalPendingRequests = loans.filter(
    (l) => l.status === LOAN_STATUS.PENDING
  ).length;
  const totalReturnedLoans = loans.filter(
    (l) => l.status === LOAN_STATUS.RETURNED
  ).length;

  const recentLoans = loans.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[#89CFF3] bg-gradient-to-r from-slate-900 via-slate-800 to-[#0088CC] p-6 sm:p-8 text-white">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-block rounded-full bg-[#00A9FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Dashboard Operasional Admin
            </span>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              Ringkasan Aktivitas Perpustakaan Unipus
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#CDF5FD]">
              Kelola katalog buku, stok eksemplar, verifikasi peminjaman, dan konfirmasi pengembalian secara terpusat.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/admin/loan-requests" className="btn-primary">
              Proses Pengajuan ({totalPendingRequests})
            </Link>
            <Link
              to="/admin/books"
              className="inline-flex items-center gap-2 rounded-xl border border-[#89CFF3]/40 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
            >
              Kelola Buku
            </Link>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards (PRD 6.6) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: 'Total Judul Buku',
            value: totalBooks,
            sub: 'Koleksi terdaftar di katalog',
            icon: Library,
            link: '/admin/books',
            color: 'bg-[#CDF5FD] text-[#00A9FF]',
          },
          {
            label: 'Total Stok Buku Tersedia',
            value: totalAvailableStock,
            sub: 'Eksemplar siap dipinjam',
            icon: Layers,
            link: '/admin/books',
            color: 'bg-[#A0E9FF]/60 text-[#0088CC]',
          },
          {
            label: 'Total Pengguna Terdaftar',
            value: totalRegisteredUsers,
            sub: 'Akun User & Petugas Admin',
            icon: Users,
            link: '/admin/users',
            color: 'bg-indigo-50 text-indigo-600',
          },
          {
            label: 'Total Peminjaman Aktif',
            value: totalActiveLoans,
            sub: 'Berstatus Borrowed / Overdue',
            icon: BookCheck,
            link: '/admin/active-loans',
            color: 'bg-sky-50 text-sky-600',
          },
          {
            label: 'Menunggu Persetujuan',
            value: totalPendingRequests,
            sub: 'Permintaan berstatus Pending',
            icon: Clock,
            link: '/admin/loan-requests',
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Total Pengembalian Selesai',
            value: totalReturnedLoans,
            sub: 'Transaksi berstatus Returned',
            icon: RotateCcw,
            link: '/admin/returns',
            color: 'bg-emerald-50 text-emerald-600',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="card-surface group p-5 hover:border-[#00A9FF] hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{card.label}</span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{card.value}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{card.sub}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#00A9FF] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Transactions & Activity Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-8 card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Daftar Transaksi Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                6 transaksi peminjaman dan pengembalian paling mutakhir
              </p>
            </div>
            <Link
              to="/admin/history"
              className="text-xs font-bold text-[#00A9FF] hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-3">Kode</th>
                  <th className="px-5 py-3">Peminjam</th>
                  <th className="px-5 py-3">Buku</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#CDF5FD]/20">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0088CC]">
                      {loan.transaction_code}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{loan.user_name}</p>
                      <p className="text-[11px] text-slate-500">{loan.user_member_id}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 line-clamp-1 max-w-[180px]">
                        {loan.items.map((i) => i.book?.title).join(', ')}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {loan.total_books} buku
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(loan.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLoan(loan)}
                        className="btn-outline px-2.5 py-1 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs (PRD 10.7) */}
        <div className="lg:col-span-4 card-surface p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#00A9FF]" />
            <h2 className="text-base font-extrabold text-slate-900">
              Log Aktivitas Sistem
            </h2>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {activityLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
              >
                <span className="inline-block rounded-md bg-[#CDF5FD] px-2 py-0.5 font-mono text-[10px] font-bold text-[#0088CC]">
                  {log.activity}
                </span>
                <p className="mt-1.5 font-medium text-slate-800 leading-relaxed">
                  {log.description}
                </p>
                <span className="mt-1 block text-[10px] text-slate-400">
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
