import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, XCircle, Eye, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function LoanRequestsPage() {
  const { currentUser } = useAuth();
  const { loans, cancelLoanRequest } = useLibrary();
  const { showToast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState(null);

  const requestLoans = loans.filter(
    (l) =>
      l.user_id === currentUser?.id &&
      (l.status === LOAN_STATUS.PENDING ||
        l.status === LOAN_STATUS.REJECTED ||
        l.status === LOAN_STATUS.CANCELLED)
  );

  const handleCancel = async (loanId) => {
    const result = await cancelLoanRequest(loanId);
    if (result.success) {
      showToast(result.message, 'info');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Permintaan Peminjaman Saya
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Daftar pengajuan peminjaman yang sedang menunggu persetujuan Admin atau yang telah dibatalkan/ditolak.
          </p>
        </div>
        <Link to="/books" className="btn-primary self-start sm:self-auto">
          <ShoppingBag className="h-4 w-4" />
          Buat Pengajuan Baru
        </Link>
      </div>

      {requestLoans.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak Ada Permintaan Peminjaman
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Semua pengajuan Anda yang telah disetujui dapat dilihat pada menu Buku yang Dipinjam.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requestLoans.map((loan) => (
            <div
              key={loan.id}
              className="card-surface p-6 transition-all hover:border-[#89CFF3]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-[#0088CC]">
                    {loan.transaction_code}
                  </span>
                  <LoanStatusBadge status={loan.status} />
                </div>
                <span className="text-xs text-slate-500">
                  Diajukan pada: <strong>{formatDateTime(loan.created_at)}</strong>
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {loan.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 p-3"
                  >
                    <img
                      src={item.book?.cover_image}
                      alt={item.book?.title}
                      className="h-14 w-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {item.book?.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.book?.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {loan.notes && (
                <p className="mt-3 text-xs text-slate-600">
                  <strong>Catatan:</strong> {loan.notes}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLoan(loan)}
                  className="btn-outline py-2 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Detail
                </button>

                {loan.status === LOAN_STATUS.PENDING && (
                  <button
                    type="button"
                    onClick={() => handleCancel(loan.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Batalkan Pengajuan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
