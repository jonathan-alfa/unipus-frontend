import React, { useState } from 'react';
import { BookCheck, Calendar, Eye, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate, getDaysRemaining } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function ActiveLoansAdminPage() {
  const { loans, updateLoanDueDate, confirmBookReturn, handoverLoan } = useLibrary();
  const { showToast } = useToast();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [editingDueLoan, setEditingDueLoan] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  const activeLoans = loans.filter(
    (l) =>
      l.status === LOAN_STATUS.APPROVED ||
      l.status === LOAN_STATUS.BORROWED ||
      l.status === LOAN_STATUS.OVERDUE
  );

  const handleSaveDueDate = (e) => {
    e.preventDefault();
    if (!editingDueLoan || !newDueDate) return;
    const res = updateLoanDueDate(editingDueLoan.id, newDueDate);
    if (res.success) {
      showToast(res.message, 'success');
      setEditingDueLoan(null);
    }
  };

  const handleHandover = async (loanId) => {
    const res = await handoverLoan(loanId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDirectConfirmReturn = async (loanId) => {
    const res = await confirmBookReturn(loanId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Monitoring Peminjaman Aktif & Keterlambatan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Pantau seluruh transaksi peminjaman berjalan, identifikasi keterlambatan (Overdue), serta atur ulang batas waktu pengembalian (PRD 6.8).
        </p>
      </div>

      {activeLoans.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <BookCheck className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak Ada Peminjaman Aktif
          </h3>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="px-5 py-3.5">Kode Transaksi</th>
                  <th className="px-5 py-3.5">Peminjam</th>
                  <th className="px-5 py-3.5">Daftar Buku</th>
                  <th className="px-5 py-3.5">Tgl Pinjam</th>
                  <th className="px-5 py-3.5">Batas Kembali</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeLoans.map((loan) => {
                  const daysLeft = getDaysRemaining(loan.due_date);
                  const isOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <tr key={loan.id} className="hover:bg-[#CDF5FD]/20">
                      <td className="px-5 py-4 font-mono font-bold text-[#0088CC]">
                        {loan.transaction_code}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{loan.user_name}</p>
                        <p className="text-[11px] text-slate-500">{loan.user_member_id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
                          {loan.items.map((i) => i.book?.title).join(', ')}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {loan.total_books} Eksemplar
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(loan.loan_date)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {formatDate(loan.due_date)}
                        </div>
                        {daysLeft !== null && (
                          <span
                            className={`text-[11px] font-bold ${
                              isOverdue ? 'text-rose-600' : 'text-[#0088CC]'
                            }`}
                          >
                            {isOverdue
                              ? `Terlambat ${Math.abs(daysLeft)} hari`
                              : `${daysLeft} hari tersisa`}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDueLoan(loan);
                              setNewDueDate(
                                loan.due_date ? loan.due_date.slice(0, 10) : ''
                              );
                            }}
                            className="btn-outline px-2.5 py-1.5 text-xs"
                            title="Atur Tanggal Pengembalian"
                          >
                            <Calendar className="h-3.5 w-3.5 text-[#00A9FF]" />
                            Atur Due Date
                          </button>

                          {loan.status === LOAN_STATUS.APPROVED ? (
                            <button
                              type="button"
                              onClick={() => handleHandover(loan.id)}
                              className="btn-primary px-3 py-1.5 text-xs"
                              title="PATCH /api/admin/loans/:id/handover"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Serahkan Buku (Handover)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDirectConfirmReturn(loan.id)}
                              className="btn-primary px-3 py-1.5 text-xs"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Terima Kembali
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedLoan(loan)}
                            className="btn-outline px-2.5 py-1.5 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Due Date Modal */}
      {editingDueLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingDueLoan(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-[#89CFF3] bg-white p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              Atur Batas Waktu Pengembalian
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Transaksi: {editingDueLoan.transaction_code} ({editingDueLoan.user_name})
            </p>
            <form onSubmit={handleSaveDueDate} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Tanggal Batas Pengembalian Baru
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDueLoan(null)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Tanggal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
