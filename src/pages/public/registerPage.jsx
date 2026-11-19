import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  User,
  IdCard,
  Mail,
  Lock,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !formData.name.trim() ||
      !formData.nim.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setErrorMsg('Nama Lengkap, NIM, Alamat Email, dan Password wajib dilengkapi.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Password harus terdiri dari minimal 8 karakter (sesuai validasi Backend).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    const result = await register(formData);
    if (!result.success) {
      setErrorMsg(result.message);
      showToast(result.message, 'error');
      return;
    }

    showToast(
      'Registrasi berhasil! NIM Anda berstatus Pending menunggu verifikasi Admin/Petugas.',
      'success'
    );
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-b from-[#CDF5FD]/50 to-slate-50">
      <div className="w-full max-w-lg">
        <div className="card-surface border-[#89CFF3] p-6 sm:p-8">
          <div className="text-center">
            <img
              src="/logo-unipma.png"
              alt="Logo UNIPUS"
              className="mx-auto mb-3 h-14 w-14 object-contain drop-shadow-sm"
            />
            <h1 className="text-2xl font-extrabold text-slate-900">
              Registrasi Anggota Unipus
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Daftarkan akun dan NIM mahasiswa UNIPMA Anda untuk mengakses layanan perpustakaan digital
            </p>
          </div>

          {/* Info Verifikasi NIM */}
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#89CFF3] bg-[#CDF5FD]/40 p-3.5 text-xs text-slate-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#00A9FF]" />
            <div>
              Setelah mendaftar, <strong>NIM</strong> Anda akan berstatus{' '}
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800">
                pending
              </span>{' '}
              dan akan diverifikasi oleh Admin/Petugas Perpustakaan sebelum Anda dapat mengajukan transaksi peminjaman buku.
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* 1. Nama Lengkap */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Andi Pratama"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* 2. NIM (Unique) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Nomor Induk Mahasiswa (NIM) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="nim"
                  required
                  value={formData.nim}
                  onChange={handleChange}
                  placeholder="Contoh: 23051204001"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* 3. Alamat Email (Unique Lower) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="andi@student.unipus.ac.id"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 karakter"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Konfirmasi Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-2">
              <UserPlus className="h-4 w-4" />
              Daftar & Ajukan Verifikasi NIM
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-[#00A9FF] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
