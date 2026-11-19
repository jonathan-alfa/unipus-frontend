import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function AdminHistoryPage() {
  const { loans } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const filteredLoans = loans
    .filter((l) => statusFilter === 'ALL' || l.status === statusFilter)
    .filter((l) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        l.transaction_code.toLowerCase().includes(q) ||
        l.user_name.toLowerCase().includes(q) ||
        l.items.some((i) => i.book?.title?.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Seluruh Riwayat Transaksi Perpustakaan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Pencatatan lengkap seluruh transaksi peminjaman dan pengembalian buku sesuai PRD Bagian 6.9 (FR-13).
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card-surface p-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID transaksi, nama peminjam, atau judul buku..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-56"
        >
          <option value="ALL">Semua Status ({loans.length})</option>
          {Object.values(LOAN_STATUS).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">ID Transaksi</th>
                <th className="px-5 py-3.5">Nama Pengguna</th>
                <th className="px-5 py-3.5">Buku Dipinjam</th>
                <th className="px-5 py-3.5">Tgl Pengajuan</th>
                <th className="px-5 py-3.5">Tgl Pinjam</th>
                <th className="px-5 py-3.5">Batas Kembali</th>
                <th className="px-5 py-3.5">Tgl Kembali Aktual</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-[#CDF5FD]/20">
                  <td className="px-5 py-4 font-mono font-bold text-[#0088CC]">
                    {loan.transaction_code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{loan.user_name}</p>
                    <p className="text-[11px] text-slate-500">{loan.user_member_id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 line-clamp-1 max-w-[180px]">
                      {loan.items.map((i) => i.book?.title).join(', ')}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {loan.total_books} Eksemplar
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(loan.created_at)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(loan.loan_date)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(loan.due_date)}
                  </td>
                  <td className="px-5 py-4 text-emerald-700 font-semibold">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
