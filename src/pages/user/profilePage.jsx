import React, { useState } from 'react';
import {
  User,
  IdCard,
  Mail,
  Lock,
  Save,
  BadgeCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import { NIM_STATUS, NIM_STATUS_CONFIG } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatDate';

export default function ProfilePage() {
  const { currentUser, users, updateProfile } = useAuth();
  const { showToast } = useToast();

  const liveUser = users.find((u) => u.id === currentUser?.id) || currentUser;
  const reviewer = liveUser?.nim_reviewed_by
    ? users.find((u) => u.id === Number(liveUser.nim_reviewed_by))
    : null;

  const [formData, setFormData] = useState({
    name: liveUser?.name || '',
    nim: liveUser?.nim || '',
    email: liveUser?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword.length < 8) {
      showToast('Password baru minimal harus 8 karakter.', 'error');
      return;
    }
    if (formData.newPassword && !formData.currentPassword) {
      showToast('Masukkan password saat ini untuk mengganti password baru.', 'error');
      return;
    }

    const result = await updateProfile(formData);
    if (result.success) {
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      showToast(
        'Profil berhasil diperbarui! Jika Anda mengubah NIM, status verifikasi NIM menjadi Pending.',
        'success'
      );
    } else {
      showToast(result.message, 'error');
    }
  };

  const nimStatusInfo =
    NIM_STATUS_CONFIG[liveUser?.nim_status] || NIM_STATUS_CONFIG[NIM_STATUS.NONE];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Profil Pengguna & Status Verifikasi NIM
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Kelola informasi identitas akun anggota perpustakaan Unipus serta pantau status verifikasi Nomor Induk Mahasiswa (NIM) Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Member Card & NIM Verification Detail */}
        <div className="md:col-span-5 space-y-4">
          <div className="card-surface overflow-hidden border-[#89CFF3]">
            <div className="bg-gradient-to-br from-[#00A9FF] to-[#89CFF3] p-6 text-center text-white">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-extrabold backdrop-blur-xs">
                {liveUser?.name?.charAt(0)}
              </div>
              <h2 className="mt-3 text-base font-extrabold">{liveUser?.name}</h2>
              <p className="text-xs text-[#CDF5FD]">{liveUser?.email}</p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold">
                <BadgeCheck className="h-3.5 w-3.5" />
                Role: {liveUser?.role}
              </span>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Nomor Induk (NIM):</span>
                <span className="font-mono font-bold text-[#0088CC]">
                  {liveUser?.nim || 'Belum diisi'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status Verifikasi NIM:</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${nimStatusInfo.bgClass}`}
                >
                  {nimStatusInfo.label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status Akun:</span>
                <span className="font-bold text-emerald-700">
                  {liveUser?.is_active !== false ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terdaftar Sejak:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(liveUser?.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* NIM Verification Audit Box */}
          <div className="card-surface p-5 space-y-2.5 text-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
              {liveUser?.nim_status === NIM_STATUS.APPROVED ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : liveUser?.nim_status === NIM_STATUS.REJECTED ? (
                <ShieldAlert className="h-4 w-4 text-rose-600" />
              ) : (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              Informasi Verifikasi NIM
            </h4>
            <div className="space-y-1.5 text-slate-600">
              <p>
                <strong>Diverifikasi Oleh:</strong>{' '}
                {reviewer ? reviewer.name : '-'}
              </p>
              <p>
                <strong>Waktu Verifikasi:</strong>{' '}
                {formatDateTime(liveUser?.nim_reviewed_at)}
              </p>
              <p>
                <strong>Catatan Petugas:</strong>{' '}
                {liveUser?.nim_review_note || 'Belum ada catatan verifikasi.'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ubah Data Akun & NIM
            </h3>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nomor Induk Mahasiswa (NIM) *
              </label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="nim"
                  required
                  value={formData.nim}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Apabila NIM diubah, status verifikasi NIM akan diatur ulang menjadi Menunggu Verifikasi untuk ditinjau Admin.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Wajib jika ganti password"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary">
                <Save className="h-4 w-4" />
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
