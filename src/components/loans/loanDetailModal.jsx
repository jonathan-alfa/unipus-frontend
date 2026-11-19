import React, { useEffect } from 'react';
import { X, User, BookOpen, Clock, History, ArrowRight } from 'lucide-react';
import LoanStatusBadge from '../common/loanStatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { useLibrary } from '../../context/libraryContext';

export default function LoanDetailModal({ loan, onClose }) {
  const { loans, fetchLoanDetail } = useLibrary();

  useEffect(() => {
    if (loan?.id) {
      fetchLoanDetail(loan.id);
    }
  }, [loan?.id, fetchLoanDetail]);

  if (!loan) return null;

  // Use the freshest version of the loan from LibraryContext (which includes `histories` after fetchLoanDetail)
  const activeLoan = loans.find((l) => l.id === Number(loan.id)) || loan;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-[#89CFF3] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#A0E9FF] bg-gradient-to-r from-[#CDF5FD] via-[#CDF5FD]/50 to-white px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold text-[#0088CC]">
                {activeLoan.transaction_code}
              </span>
              <LoanStatusBadge status={activeLoan.status} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Waktu Pengajuan: {formatDateTime(activeLoan.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Borrower & Approval/Return Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <User className="h-3.5 w-3.5 text-[#00A9FF]" />
                Informasi Peminjam
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{activeLoan.user_name}</p>
              <p className="text-xs text-slate-600">{activeLoan.user_email}</p>
              <p className="mt-1 font-mono text-xs font-bold text-[#0088CC]">
                NIM: {activeLoan.user_nim || '-'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock className="h-3.5 w-3.5 text-[#00A9FF]" />
                Rekaman Waktu & Petugas
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Pinjam:</span>
                  <span className="font-semibold text-slate-800">{formatDate(activeLoan.loan_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batas Kembali:</span>
                  <span className="font-semibold text-slate-800">{formatDate(activeLoan.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disetujui Oleh:</span>
                  <span className="font-semibold text-slate-800">{activeLoan.approver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Kembali:</span>
                  <span className="font-semibold text-emerald-700">{formatDateTime(activeLoan.returned_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diterima Oleh:</span>
                  <span className="font-semibold text-slate-800">{activeLoan.receiver_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {activeLoan.notes && (
            <div className="rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/30 p-3.5 text-xs text-slate-700">
              <span className="font-bold text-slate-900">Catatan Transaksi: </span>
              {activeLoan.notes}
            </div>
          )}

          {/* Books in Loan */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <BookOpen className="h-4 w-4 text-[#00A9FF]" />
              Daftar Buku yang Dipinjam ({activeLoan.items?.length || 0} Buku)
            </h4>
            <div className="space-y-2.5">
              {activeLoan.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 p-3"
                >
                  <img
                    src={item.book?.cover_book || item.book?.cover_image}
                    alt={item.book?.title}
                    className="h-16 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{item.book?.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.book?.author} • ISBN: {item.book?.isbn || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status History Timeline */}
          {activeLoan.histories && activeLoan.histories.length > 0 && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <History className="h-4 w-4 text-[#00A9FF]" />
                Riwayat Perubahan Status Transaksi
              </h4>
              <div className="space-y-2.5 border-l-2 border-[#89CFF3] pl-4 ml-2">
                {activeLoan.histories.map((hist) => (
                  <div
                    key={hist.id}
                    className="relative rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs"
                  >
                    <span className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-[#00A9FF] ring-4 ring-white" />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700">
                          {hist.from_status || 'BARU'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[#00A9FF]" />
                        <span className="rounded bg-[#CDF5FD] px-2 py-0.5 text-[10px] text-[#0088CC]">
                          {hist.to_status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(hist.created_at)}
                      </span>
                    </div>
                    {hist.note && (
                      <p className="mt-1 text-slate-600">{hist.note}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Diproses oleh: <strong className="text-slate-600">{hist.changed_by_name}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button onClick={onClose} className="btn-outline">
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
