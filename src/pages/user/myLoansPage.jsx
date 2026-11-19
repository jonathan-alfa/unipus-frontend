import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, RotateCcw, Eye, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS } from '../../utils/constants';
import { formatDate, getDaysRemaining } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';

export default function MyLoansPage() {
  const { currentUser } = useAuth();
  const { loans, requestBookReturn } = useLibrary();
  const { showToast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState(null);

  const activeLoans = loans.filter(
    (l) =>
      l.user_id === currentUser?.id &&
      (l.status === LOAN_STATUS.APPROVED ||
        l.status === LOAN_STATUS.BORROWED ||
        l.status === LOAN_STATUS.OVERDUE ||
        l.status === LOAN_STATUS.RETURN_REQUESTED)
  );

  const handleReturnRequest = async (loanId) => {
    const result = await requestBookReturn(loanId);
    if (result.success) {
      showToast(result.message, 'success', 'Pengajuan Pengembalian Terkirim');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Buku yang Sedang Dipinjam
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Kelola daftar buku aktif yang sedang Anda pinjam dan ajukan pengembalian buku sebelum melewati batas waktu.
        </p>
      </div>

      {activeLoans.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <BookMarked className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak Ada Pinjaman Aktif
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Anda belum memiliki buku yang berstatus sedang dipinjam. Silakan pilih buku dari katalog untuk mengajukan peminjaman.
          </p>
          <Link to="/books" className="btn-primary mt-5">
            Cari Buku di Katalog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeLoans.map((loan) => {
            const daysLeft = getDaysRemaining(loan.due_date);
            const isOverdue = daysLeft !== null && daysLeft < 0;

            return (
              <div
                key={loan.id}
                className="card-surface overflow-hidden border border-slate-200 hover:border-[#89CFF3]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#CDF5FD] bg-[#CDF5FD]/30 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-[#0088CC]">
                      {loan.transaction_code}
                    </span>
                    <LoanStatusBadge status={loan.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Tanggal Pinjam: </span>
                      <strong className="text-slate-800">{formatDate(loan.loan_date)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Batas Kembali: </span>
                      <strong className={isOverdue ? 'text-rose-600' : 'text-slate-900'}>
                        {formatDate(loan.due_date)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {loan.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <img
                          src={item.book?.cover_image}
                          alt={item.book?.title}
                          className="h-20 w-14 rounded-xl object-cover shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${item.book?.id}`}
                            className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-[#00A9FF]"
                          >
                            {item.book?.title}
                          </Link>
                          <p className="text-xs text-slate-500">{item.book?.author}</p>
                          <span className="mt-1.5 inline-block rounded-md bg-[#CDF5FD] px-2 py-0.5 text-[11px] font-bold text-[#0088CC]">
                            {item.book?.category_name} • {item.quantity} Buku
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="text-xs">
                      {loan.status === LOAN_STATUS.RETURN_REQUESTED ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-purple-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Pengajuan pengembalian telah dikirim. Menunggu verifikasi Admin perpustakaan.
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-rose-600">
                          <AlertTriangle className="h-4 w-4" />
                          Melewati batas waktu pengembalian ({Math.abs(daysLeft)} hari). Segera ajukan pengembalian!
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Sisa waktu peminjaman: <strong className="text-[#0088CC]">{daysLeft} hari</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedLoan(loan)}
                        className="btn-outline py-2 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail Transaksi
                      </button>

                      {(loan.status === LOAN_STATUS.BORROWED ||
                        loan.status === LOAN_STATUS.OVERDUE) && (
                        <button
                          type="button"
                          onClick={() => handleReturnRequest(loan.id)}
                          className="btn-primary py-2 text-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Ajukan Pengembalian Buku
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
