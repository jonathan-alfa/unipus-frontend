import React, { useState } from 'react';
import { Save, Clock, BookOpen, Info, Database } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import { formatDateTime } from '../../utils/formatDate';

export default function LoanSettingsPage() {
  const { settings, settingsRows, updateSettings } = useLibrary();
  const { users } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    defaultLoanDurationDays: settings.defaultLoanDurationDays,
    maxBooksPerLoan: settings.maxBooksPerLoan,
    maxActiveLoansPerUser: settings.maxActiveLoansPerUser,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateSettings({
      defaultLoanDurationDays: Number(formData.defaultLoanDurationDays),
      maxBooksPerLoan: Number(formData.maxBooksPerLoan),
      maxActiveLoansPerUser: Number(formData.maxActiveLoansPerUser),
    });
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Pengaturan Durasi & Kebijakan Perpustakaan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Atur durasi standar peminjaman buku serta batas maksimal buku yang dapat dipinjam oleh setiap anggota.
        </p>
      </div>

      <div className="rounded-2xl border border-[#89CFF3] bg-[#CDF5FD]/40 p-4 text-xs text-slate-700 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#00A9FF] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">Informasi Kebijakan Peminjaman:</p>
          <p className="mt-0.5">
            Perubahan pengaturan durasi peminjaman dan kuota buku di halaman ini akan langsung diterapkan pada setiap pengajuan peminjaman baru.
          </p>
        </div>
      </div>

      {/* Settings Table Preview */}
      <div className="card-surface overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <Database className="h-4 w-4 text-[#00A9FF]" />
          <h3 className="text-sm font-extrabold text-slate-900">
            Ringkasan Konfigurasi Aktif Saat Ini
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3">Pengaturan</th>
                <th className="px-5 py-3">Nilai</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3">Diperbarui Oleh</th>
                <th className="px-5 py-3">Terakhir Diperbarui</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {settingsRows.map((row) => {
                const updater = users.find((u) => u.id === Number(row.updated_by));
                return (
                  <tr key={row.key} className="hover:bg-[#CDF5FD]/20">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#0088CC]">
                      {row.key}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">
                      {row.value}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{row.description}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">
                      {updater ? updater.name : `User #${row.updated_by}`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {formatDateTime(row.updated_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form to update settings values */}
      <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          Ubah Nilai Konfigurasi
        </h3>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock className="h-4 w-4 text-[#00A9FF]" />
            Durasi Peminjaman Standar (Hari) *
          </label>
          <input
            type="number"
            min={1}
            max={60}
            required
            value={formData.defaultLoanDurationDays}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                defaultLoanDurationDays: e.target.value,
              }))
            }
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slate-700">
            <BookOpen className="h-4 w-4 text-[#00A9FF]" />
            Maksimal Buku Aktif per Peminjam *
          </label>
          <input
            type="number"
            min={1}
            max={10}
            required
            value={formData.maxBooksPerLoan}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                maxBooksPerLoan: e.target.value,
              }))
            }
            className="input-field"
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" />
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}
