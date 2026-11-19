import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, User } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function LoanRequestsAdminPage() {
  const { loans, settings, approveLoanRequest, rejectLoanRequest } = useLibrary();
  const { showToast } = useToast();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [approveModalLoan, setApproveModalLoan] = useState(null);
  const [approveForm, setApproveForm] = useState({
    durationDays: settings.defaultLoanDurationDays || 7,
    dueDate: '',
    requirePickup: false,
    note: '',
  });
  const [rejectModalLoan, setRejectModalLoan] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingLoans = loans.filter((l) => l.status === LOAN_STATUS.PENDING);

  const handleOpenApprove = (loan) => {
    setApproveModalLoan(loan);
    setApproveForm({
      durationDays: settings.defaultLoanDurationDays || 7,
      dueDate: '',
      requirePickup: false,
      note: 'Disetujui oleh Admin Perpustakaan',
    });
  };

  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    if (!approveModalLoan) return;

    const result = await approveLoanRequest(approveModalLoan.id, {
      durationDays: Number(approveForm.durationDays),
      dueDate: approveForm.dueDate || undefined,
      requirePickup: approveForm.requirePickup,
      note: approveForm.note,
    });

    if (result.success) {
      showToast(result.message, 'success', 'Peminjaman Disetujui');
      setApproveModalLoan(null);
    } else {
      showToast(result.message, 'error', 'Gagal Menyetujui');
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalLoan) return;
    const result = await rejectLoanRequest(rejectModalLoan.id, rejectReason);
    if (result.success) {
      showToast(result.message, 'info');
      setRejectModalLoan(null);
      setRejectReason('');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Persetujuan Permintaan Peminjaman
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Verifikasi permintaan peminjaman buku yang sedang menunggu persetujuan. Stok buku otomatis diperbarui ketika pengajuan disetujui.
        </p>
      </div>

      {pendingLoans.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Semua Permintaan Telah Diproses
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Tidak ada antrean pengajuan peminjaman yang menunggu verifikasi saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingLoans.map((loan) => (
            <div
              key={loan.id}
              className="card-surface overflow-hidden border border-amber-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/60 px-6 py-4 border-b border-amber-200/70">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {loan.transaction_code}
                  </span>
                  <LoanStatusBadge status={loan.status} />
                </div>
                <span className="text-xs text-slate-500">
                  Waktu Pengajuan: <strong>{formatDateTime(loan.created_at)}</strong>
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A9FF] text-white font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{loan.user_name}</p>
                      <p className="text-xs text-slate-500">
                        NIM: {loan.user_nim || '-'} • {loan.user_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">
                    Durasi Standar: <strong>{settings.defaultLoanDurationDays} Hari</strong>
                  </div>
                </div>

                {/* Requested Books */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {loan.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 rounded-2xl border border-slate-200 p-3"
                    >
                      <img
                        src={item.book?.cover_book || item.book?.cover_image}
                        alt={item.book?.title}
                        className="h-16 w-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {item.book?.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{item.book?.author}</p>
                        <span
                          className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            item.book?.available_stock > 0
                              ? 'bg-[#CDF5FD] text-[#0088CC]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          Stok Tersedia Saat Ini: {item.book?.available_stock ?? 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {loan.notes && (
                  <p className="text-xs text-slate-600">
                    <strong>Catatan Peminjam:</strong> {loan.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedLoan(loan)}
                    className="btn-outline py-2 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Detail
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalLoan(loan);
                      setRejectReason('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <XCircle className="h-4 w-4" />
                    Tolak Pengajuan
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenApprove(loan)}
                    className="btn-primary py-2 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Setujui Peminjaman
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal matching `approveLoanBody` in backend/routes/admin.routes.js */}
      {approveModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setApproveModalLoan(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#89CFF3] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              Setujui Peminjaman {approveModalLoan.transaction_code}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Peminjam: <strong>{approveModalLoan.user_name}</strong> ({approveModalLoan.items?.length} Buku)
            </p>

            <form onSubmit={handleConfirmApprove} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Durasi Pinjam (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={approveForm.durationDays}
                    onChange={(e) =>
                      setApproveForm((p) => ({ ...p, durationDays: e.target.value }))
                    }
                    className="input-field text-xs"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Batas Tanggal Kembali (Opsional)
                  </label>
                  <input
                    type="date"
                    value={approveForm.dueDate}
                    onChange={(e) =>
                      setApproveForm((p) => ({ ...p, dueDate: e.target.value }))
                    }
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-[#A0E9FF] bg-[#CDF5FD]/30 p-3">
                <input
                  id="require-pickup-chk"
                  type="checkbox"
                  checked={approveForm.requirePickup}
                  onChange={(e) =>
                    setApproveForm((p) => ({ ...p, requirePickup: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A9FF]"
                />
                <label htmlFor="require-pickup-chk" className="text-xs text-slate-700">
                  <strong className="text-slate-900">Wajib Ambil Buku di Perpustakaan Terlebih Dahulu</strong>
                  <span className="block text-[11px] text-slate-500">
                    Jika dicentang, status menjadi Disetujui (Siap Diambil) terlebih dahulu hingga petugas menekan tombol Serahkan Buku.
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Catatan Persetujuan
                </label>
                <input
                  type="text"
                  value={approveForm.note}
                  onChange={(e) =>
                    setApproveForm((p) => ({ ...p, note: e.target.value }))
                  }
                  className="input-field text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalLoan(null)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Konfirmasi Setujui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setRejectModalLoan(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              Tolak Permintaan {rejectModalLoan.transaction_code}
            </h3>
            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Alasan Penolakan (Dikirim ke Notifikasi Pengguna)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Buku sedang dalam pemeliharaan / melebihi kuota pinjam..."
                  className="input-field text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModalLoan(null)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Konfirmasi Tolak
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
