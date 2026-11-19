import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Eye,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { LOAN_STATUS, NIM_STATUS, NIM_STATUS_CONFIG } from '../../utils/constants';
import { formatDate, getDaysRemaining } from '../../utils/formatDate';
import LoanStatusBadge from '../../components/common/loanStatusBadge';
import LoanDetailModal from '../../components/loans/loanDetailModal';
import BookCard from '../../components/books/bookCard';

export default function UserDashboardPage() {
  const { currentUser, users } = useAuth();
  const { loans, books, requestBookReturn } = useLibrary();
  const { showToast } = useToast();
  const [selectedLoan, setSelectedLoan] = useState(null);

  const liveUser = users.find((u) => u.id === currentUser?.id) || currentUser;
  const nimStatusInfo =
    NIM_STATUS_CONFIG[liveUser?.nim_status] || NIM_STATUS_CONFIG[NIM_STATUS.NONE];

  const userLoans = loans.filter((l) => l.user_id === currentUser?.id);

  const activeBorrowedLoans = userLoans.filter(
    (l) =>
      l.status === LOAN_STATUS.APPROVED ||
      l.status === LOAN_STATUS.BORROWED ||
      l.status === LOAN_STATUS.OVERDUE ||
      l.status === LOAN_STATUS.RETURN_REQUESTED
  );
  const pendingLoans = userLoans.filter((l) => l.status === LOAN_STATUS.PENDING);
  const returnedLoans = userLoans.filter((l) => l.status === LOAN_STATUS.RETURNED);

  const totalBooksCurrentlyBorrowed = activeBorrowedLoans.reduce(
    (sum, l) => sum + l.total_books,
    0
  );

  const recommendedBooks = books.filter((b) => b.available_stock > 0).slice(0, 4);

  const handleRequestReturn = async (loanId) => {
    const result = await requestBookReturn(loanId);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#89CFF3] bg-gradient-to-r from-[#CDF5FD] via-[#A0E9FF]/50 to-white p-6 sm:p-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-[#00A9FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              Dashboard Anggota Unipus
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${nimStatusInfo.bgClass}`}
            >
              NIM ({liveUser?.nim || '-'}): {nimStatusInfo.label}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Halo, {liveUser?.name}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Pantau buku yang sedang Anda pinjam, status verifikasi NIM & persetujuan Admin, serta batas waktu pengembalian.
          </p>
        </div>
        <Link to="/books" className="btn-primary self-start sm:self-auto">
          <Compass className="h-4 w-4" />
          Cari & Pinjam Buku Baru
        </Link>
      </div>

      {/* NIM Verification Alert if not approved yet (`users.nim_status`) */}
      {liveUser?.nim_status !== NIM_STATUS.APPROVED && (
        <div
          className={`rounded-2xl border p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            liveUser?.nim_status === NIM_STATUS.REJECTED
              ? 'border-rose-300 bg-rose-50 text-rose-800'
              : 'border-amber-300 bg-amber-50 text-amber-800'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">
                Status Verifikasi NIM Anda: {liveUser?.nim_status?.toUpperCase()}
              </p>
              <p className="mt-0.5">
                {liveUser?.nim_status === NIM_STATUS.REJECTED
                  ? `NIM Anda ditolak oleh Admin. Catatan: "${
                      liveUser?.nim_review_note || 'Silakan perbaiki NIM Anda di halaman Profil'
                    }".`
                  : 'NIM Anda sedang menunggu verifikasi dari Admin/Petugas Perpustakaan. Anda dapat mengajukan peminjaman buku setelah NIM disetujui (approved).'}
              </p>
            </div>
          </div>
          <Link to="/profile" className="btn-outline shrink-0 text-xs">
            Cek / Perbarui NIM di Profil
          </Link>
        </div>
      )}

      {/* KPI Summary Cards (PRD 6.5) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface border-l-4 border-l-[#00A9FF] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Buku Sedang Dipinjam</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CDF5FD] text-[#00A9FF]">
              <BookMarked className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {totalBooksCurrentlyBorrowed} <span className="text-sm font-semibold text-slate-500">Buku</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dari {activeBorrowedLoans.length} transaksi aktif
          </p>
        </div>

        <div className="card-surface border-l-4 border-l-amber-400 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Menunggu Persetujuan</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {pendingLoans.length} <span className="text-sm font-semibold text-slate-500">Pengajuan</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Menunggu verifikasi Admin</p>
        </div>

        <div className="card-surface border-l-4 border-l-emerald-500 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Selesai Dikembalikan</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {returnedLoans.length} <span className="text-sm font-semibold text-slate-500">Transaksi</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Tercatat di riwayat akun</p>
        </div>

        <div className="card-surface border-l-4 border-l-[#89CFF3] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Riwayat Transaksi</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CDF5FD]/70 text-[#0088CC]">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {userLoans.length} <span className="text-sm font-semibold text-slate-500">Total</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Seluruh aktivitas peminjaman</p>
        </div>
      </div>

      {/* Currently Borrowed Books & Active Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 card-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Buku yang Sedang Dipinjam
              </h2>
              <p className="text-xs text-slate-500">
                Daftar transaksi aktif beserta batas waktu pengembalian
              </p>
            </div>
            <Link
              to="/my-loans"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#00A9FF] hover:underline"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {activeBorrowedLoans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center">
              <p className="text-xs font-semibold text-slate-500">
                Anda sedang tidak memiliki pinjaman buku aktif saat ini.
              </p>
              <Link to="/books" className="btn-secondary mt-3 text-xs">
                Jelajahi Katalog Buku
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBorrowedLoans.map((loan) => {
                const daysLeft = getDaysRemaining(loan.due_date);
                const isOverdue = daysLeft !== null && daysLeft < 0;

                return (
                  <div
                    key={loan.id}
                    className="rounded-2xl border border-slate-200 p-4 transition-all hover:border-[#89CFF3]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-extrabold text-[#0088CC]">
                          {loan.transaction_code}
                        </span>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Batas Kembali:</span>
                        <span
                          className={`font-bold ${
                            isOverdue ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {formatDate(loan.due_date)}
                        </span>
                        {daysLeft !== null && (
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700'
                                : daysLeft <= 2
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-[#CDF5FD] text-[#0088CC]'
                            }`}
                          >
                            {isOverdue
                              ? `Terlambat ${Math.abs(daysLeft)} hari`
                              : `${daysLeft} hari lagi`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Books inside loan */}
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {loan.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.book?.cover_image}
                            alt={item.book?.title}
                            className="h-14 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
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

                    <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLoan(loan)}
                        className="btn-outline py-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </button>

                      {(loan.status === LOAN_STATUS.BORROWED ||
                        loan.status === LOAN_STATUS.OVERDUE) && (
                        <button
                          type="button"
                          onClick={() => handleRequestReturn(loan.id)}
                          className="btn-primary py-1.5 text-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Ajukan Pengembalian
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Requests Column */}
        <div className="lg:col-span-4 card-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Permintaan Pending
            </h2>
            <Link
              to="/my-requests"
              className="text-xs font-bold text-[#00A9FF] hover:underline"
            >
              Kelola
            </Link>
          </div>

          {pendingLoans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center px-3">
              <p className="text-xs text-slate-500">
                Tidak ada permintaan peminjaman yang sedang menunggu persetujuan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {loan.transaction_code}
                    </span>
                    <LoanStatusBadge status={loan.status} />
                  </div>
                  <p className="text-xs text-slate-600">
                    {loan.items.length} Buku:{' '}
                    <strong>
                      {loan.items.map((i) => i.book?.title).join(', ')}
                    </strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Diajukan: {formatDate(loan.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section (PRD 6.5) */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Rekomendasi Buku Tersedia Untuk Anda
            </h2>
            <p className="text-xs text-slate-500">
              Tambahkan ke Book Cart untuk meminjam beberapa buku sekaligus
            </p>
          </div>
          <Link to="/books" className="text-xs font-bold text-[#00A9FF] hover:underline">
            Lihat Katalog Lengkap →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {recommendedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>

      <LoanDetailModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
    </div>
  );
}
