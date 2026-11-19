import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Power,
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import { ROLES, LOAN_STATUS, NIM_STATUS, NIM_STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatDate';

export default function ManageUsersPage() {
  const { users, reviewUserNim, toggleUserActive } = useAuth();
  const { loans } = useLibrary();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [nimFilter, setNimFilter] = useState('ALL');
  const [reviewModalUser, setReviewModalUser] = useState(null);
  const [reviewAction, setReviewAction] = useState(NIM_STATUS.APPROVED);
  const [reviewNote, setReviewNote] = useState('');

  const filteredUsers = users
    .filter((u) => nimFilter === 'ALL' || u.nim_status === nimFilter)
    .filter((u) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.nim && u.nim.toLowerCase().includes(q))
      );
    });

  const handleOpenReview = (user, status) => {
    setReviewModalUser(user);
    setReviewAction(status);
    setReviewNote(
      status === NIM_STATUS.APPROVED
        ? 'NIM Mahasiswa Aktif UNIPMA Terverifikasi'
        : ''
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalUser) return;
    const res = await reviewUserNim(reviewModalUser.id, {
      status: reviewAction,
      note: reviewNote,
    });
    if (res.success) {
      showToast(
        res.message,
        reviewAction === NIM_STATUS.APPROVED ? 'success' : 'info'
      );
      setReviewModalUser(null);
      setReviewNote('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleToggleActive = async (user) => {
    const res = await toggleUserActive(user.id);
    if (res.success) {
      showToast(
        `Status akun ${user.name} diubah menjadi ${
          !user.is_active ? 'Aktif' : 'Nonaktif'
        }.`,
        'info'
      );
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Manajemen Pengguna & Verifikasi NIM
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Kelola status aktif akun anggota serta verifikasi Nomor Induk Mahasiswa (NIM) sebelum pengguna dapat meminjam buku.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="card-surface p-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pengguna, email, atau NIM..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={nimFilter}
          onChange={(e) => setNimFilter(e.target.value)}
          className="input-field sm:w-64"
        >
          <option value="ALL">Semua Status NIM ({users.length})</option>
          <option value={NIM_STATUS.PENDING}>Pending Verifikasi NIM</option>
          <option value={NIM_STATUS.APPROVED}>NIM Approved</option>
          <option value={NIM_STATUS.REJECTED}>NIM Rejected</option>
          <option value={NIM_STATUS.NONE}>Belum Mengisi NIM (None)</option>
        </select>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Pengguna</th>
                <th className="px-5 py-3.5">Nomor Induk (NIM)</th>
                <th className="px-5 py-3.5">Status Verifikasi NIM</th>
                <th className="px-5 py-3.5">Peran & Status Akun</th>
                <th className="px-5 py-3.5">Pinjaman Aktif</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((user) => {
                const userLoans = loans.filter((l) => l.user_id === user.id);
                const activeCount = userLoans.filter(
                  (l) =>
                    l.status === LOAN_STATUS.BORROWED ||
                    l.status === LOAN_STATUS.OVERDUE ||
                    l.status === LOAN_STATUS.RETURN_REQUESTED
                ).length;
                const nimInfo =
                  NIM_STATUS_CONFIG[user.nim_status] ||
                  NIM_STATUS_CONFIG[NIM_STATUS.NONE];
                const reviewer = user.nim_reviewed_by
                  ? users.find((u) => u.id === Number(user.nim_reviewed_by))
                  : null;
                const isStaff =
                  (user.role || '').toLowerCase() === ROLES.ADMIN ||
                  (user.role || '').toLowerCase() === ROLES.PETUGAS;

                return (
                  <tr key={user.id} className="hover:bg-[#CDF5FD]/20">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A9FF] font-bold text-white shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-slate-500">{user.email}</p>
                          <span className="text-[10px] text-slate-400">
                            Terdaftar: {formatDate(user.created_at)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-[#0088CC]">
                      {user.nim || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${nimInfo.bgClass}`}
                      >
                        {nimInfo.label}
                      </span>
                      {user.nim_review_note && (
                        <p className="mt-1 text-[11px] text-slate-500 max-w-xs line-clamp-1">
                          Catatan: {user.nim_review_note}
                        </p>
                      )}
                      {user.nim_reviewed_at && (
                        <p className="text-[10px] text-slate-400">
                          Oleh {reviewer?.name || 'Admin'} ({formatDateTime(user.nim_reviewed_at)})
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {isStaff ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-[#A0E9FF]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {user.role}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#CDF5FD] px-2.5 py-0.5 text-[11px] font-bold text-[#0088CC]">
                            <UserCheck className="h-3.5 w-3.5" />
                            {user.role}
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-bold ${
                            user.is_active !== false
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {user.is_active !== false ? '● Aktif' : '● Nonaktif'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800">
                      {activeCount} Aktif / {userLoans.length} Total
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isStaff && (
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {user.nim_status !== NIM_STATUS.APPROVED && user.nim && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenReview(user, NIM_STATUS.APPROVED)
                              }
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                              title="Setujui NIM (Approved)"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve NIM
                            </button>
                          )}

                          {user.nim_status !== NIM_STATUS.REJECTED && user.nim && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenReview(user, NIM_STATUS.REJECTED)
                              }
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                              title="Tolak NIM (Rejected)"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject NIM
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            className="btn-outline px-2.5 py-1.5 text-[11px]"
                            title="Ubah Status is_active"
                          >
                            <Power className="h-3.5 w-3.5" />
                            {user.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NIM Review Modal (`nim_status`, `nim_review_note`) */}
      {reviewModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setReviewModalUser(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#89CFF3] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              {reviewAction === NIM_STATUS.APPROVED
                ? 'Setujui Verifikasi NIM Mahasiswa'
                : 'Tolak Verifikasi NIM Mahasiswa'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pengguna: <strong>{reviewModalUser.name}</strong> (NIM:{' '}
              <code className="font-bold text-[#0088CC]">{reviewModalUser.nim}</code>)
            </p>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Catatan Verifikasi NIM
                </label>
                <textarea
                  rows={3}
                  required={reviewAction === NIM_STATUS.REJECTED}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewAction === NIM_STATUS.APPROVED
                      ? 'Contoh: NIM sesuai dengan data mahasiswa aktif UNIPMA'
                      : 'Contoh: Format NIM tidak valid / tidak terdaftar...'
                  }
                  className="input-field text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalUser(null)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={
                    reviewAction === NIM_STATUS.APPROVED
                      ? 'btn-primary'
                      : 'rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700'
                  }
                >
                  {reviewAction === NIM_STATUS.APPROVED
                    ? 'Simpan & Setujui NIM'
                    : 'Simpan & Tolak NIM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
