export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  PETUGAS: 'petugas',
};

export const NIM_STATUS = {
  NONE: 'none',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const NIM_STATUS_CONFIG = {
  [NIM_STATUS.NONE]: {
    label: 'Belum Diisi',
    bgClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [NIM_STATUS.PENDING]: {
    label: 'Menunggu Verifikasi NIM',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  [NIM_STATUS.APPROVED]: {
    label: 'NIM Terverifikasi',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [NIM_STATUS.REJECTED]: {
    label: 'NIM Ditolak',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

// Exact lowercase codes matching `loan_statuses` in backend/db/schema & backend/routes/loan.routes.js
export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BORROWED: 'borrowed',
  RETURN_REQUESTED: 'return_requested',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
};

export const INITIAL_LOAN_STATUSES = [
  { code: LOAN_STATUS.PENDING, label: 'Menunggu Persetujuan' },
  { code: LOAN_STATUS.APPROVED, label: 'Disetujui' },
  { code: LOAN_STATUS.REJECTED, label: 'Ditolak' },
  { code: LOAN_STATUS.BORROWED, label: 'Sedang Dipinjam' },
  { code: LOAN_STATUS.RETURN_REQUESTED, label: 'Pengajuan Pengembalian' },
  { code: LOAN_STATUS.RETURNED, label: 'Dikembalikan' },
  { code: LOAN_STATUS.CANCELLED, label: 'Dibatalkan' },
  { code: LOAN_STATUS.OVERDUE, label: 'Terlambat (Overdue)' },
];

export const STATUS_CONFIG = {
  [LOAN_STATUS.PENDING]: {
    label: 'Menunggu Persetujuan',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  [LOAN_STATUS.APPROVED]: {
    label: 'Disetujui (Siap Diambil)',
    bgClass: 'bg-[#CDF5FD] text-[#0088CC] border-[#89CFF3]',
    dotClass: 'bg-[#00A9FF]',
  },
  [LOAN_STATUS.BORROWED]: {
    label: 'Sedang Dipinjam',
    bgClass: 'bg-[#CDF5FD] text-[#0088CC] border-[#89CFF3]',
    dotClass: 'bg-[#00A9FF]',
  },
  [LOAN_STATUS.RETURN_REQUESTED]: {
    label: 'Pengajuan Kembali',
    bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  [LOAN_STATUS.RETURNED]: {
    label: 'Dikembalikan',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  [LOAN_STATUS.REJECTED]: {
    label: 'Ditolak',
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  [LOAN_STATUS.CANCELLED]: {
    label: 'Dibatalkan',
    bgClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  [LOAN_STATUS.OVERDUE]: {
    label: 'Terlambat (Overdue)',
    bgClass: 'bg-red-50 text-red-700 border-red-300',
    dotClass: 'bg-red-600 animate-pulse',
  },
};

// Key-Value structure matching `library_settings` in backend/controllers/loan.controller.js
export const INITIAL_LIBRARY_SETTINGS_ROWS = [
  {
    key: 'loan_duration_days',
    value: '7',
    description: 'Durasi standar peminjaman buku dalam satuan hari kalender.',
    updated_by: 1,
    updated_at: '2026-11-01T08:00:00.000Z',
  },
  {
    key: 'max_active_loans',
    value: '3',
    description: 'Batas maksimal buku yang sedang dipinjam/diajukan per pengguna.',
    updated_by: 1,
    updated_at: '2026-11-01T08:00:00.000Z',
  },
  {
    key: 'require_nim_approval',
    value: 'true',
    description: 'Wajibkan NIM pengguna berstatus approved sebelum meminjam buku.',
    updated_by: 1,
    updated_at: '2026-11-01T08:00:00.000Z',
  },
];

export const DEFAULT_LIBRARY_SETTINGS = {
  defaultLoanDurationDays: 7,
  maxBooksPerLoan: 3,
  maxActiveLoansPerUser: 3,
};
