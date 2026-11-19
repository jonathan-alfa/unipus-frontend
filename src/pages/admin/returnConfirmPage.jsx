import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, Eye, User } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function ReturnConfirmPage() {
  const { loans, confirmBookReturn } = useLibrary();
  const { showToast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState(null);

  const returnRequestedLoans = loans.filter(
    (l) => l.status === LOAN_STATUS.RETURN_REQUESTED
  );

  const handleConfirm = async (loanId) => {
    const result = await confirmBookReturn(loanId);
    if (result.success) {
      showToast(result.message, 'success', 'Pengembalian Terverifikasi!');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Konfirmasi Pengembalian Buku
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Verifikasi pengajuan pengembalian dari User (berstatus <strong>Return Requested</strong>). Saat dikonfirmasi, status berubah menjadi <strong>Returned</strong> dan stok buku otomatis bertambah (PRD 6.4 & FR-11).
        </p>
      </div>

      {returnRequestedLoans.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <RotateCcw className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak Ada Antrean Konfirmasi Pengembalian
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Seluruh pengajuan pengembalian buku telah selesai diverifikasi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returnRequestedLoans.map((loan) => (
            <div
              key={loan.id}
              className="card-surface overflow-hidden border border-purple-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/60 px-6 py-4 border-b border-purple-200/70">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {loan.transaction_code}
                  </span>
                  <LoanStatusBadge status={loan.status} />
                </div>
                <div className="text-xs text-slate-600">
                  Batas Kembali: <strong>{formatDate(loan.due_date)}</strong>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A9FF] text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{loan.user_name}</p>
                    <p className="text-xs text-slate-500">
                      {loan.user_member_id} • {loan.user_department}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {loan.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 rounded-2xl border border-slate-200 p-3"
                    >
                      <img
                        src={item.book?.cover_image}
                        alt={item.book?.title}
                        className="h-16 w-12 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {item.book?.title}
                        </p>
                        <p className="text-[11px] text-slate-500">{item.book?.author}</p>
                        <span className="mt-1 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          +{item.quantity} Stok akan dikembalikan
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
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
                    onClick={() => handleConfirm(loan.id)}
                    className="btn-primary py-2 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Konfirmasi Buku Telah Diterima
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
