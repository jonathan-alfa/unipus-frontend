import React, { useState } from 'react';
import { History, Search, Eye } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function UserHistoryPage() {
  const { currentUser } = useAuth();
  const { loans } = useLibrary();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const userLoans = loans
    .filter((l) => l.user_id === currentUser?.id)
    .filter((l) => statusFilter === 'ALL' || l.status === statusFilter)
    .filter((l) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        l.transaction_code.toLowerCase().includes(q) ||
        l.items.some((item) => item.book?.title?.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Riwayat Transaksi Peminjaman
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Rekam jejak seluruh aktivitas pengajuan, peminjaman aktif, hingga pengembalian buku Anda.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode transaksi atau judul buku..."
            className="input-field pl-10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="ALL">Semua Status Transaksi</option>
          {Object.values(LOAN_STATUS).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">ID Transaksi</th>
                <th className="px-5 py-3.5">Buku yang Dipinjam</th>
                <th className="px-5 py-3.5">Tgl Pengajuan</th>
                <th className="px-5 py-3.5">Batas Kembali</th>
                <th className="px-5 py-3.5">Tgl Kembali Aktual</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {userLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Belum ada data riwayat transaksi yang sesuai.
                  </td>
                </tr>
              ) : (
                userLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#CDF5FD]/20">
                    <td className="px-5 py-4 font-mono font-bold text-[#0088CC]">
                      {loan.transaction_code}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {loan.items.map((i) => i.book?.title).join(', ')}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {loan.total_books} Eksemplar
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(loan.created_at)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(loan.due_date)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(loan.return_date)}
                    </td>
                    <td className="px-5 py-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLoan(loan)}
                        className="btn-outline px-3 py-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
