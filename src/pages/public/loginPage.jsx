import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import { ROLES } from '../../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.message);
      showToast(result.message, 'error');
      return;
    }

    showToast(`Selamat datang kembali, ${result.user.name}!`, 'success');
    const roleLower = (result.user.role || '').toLowerCase();
    const isStaff = roleLower === ROLES.ADMIN || roleLower === ROLES.PETUGAS;
    const redirectTarget =
      location.state?.from?.pathname ||
      (isStaff ? '/admin/dashboard' : '/dashboard');
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-gradient-to-b from-[#CDF5FD]/50 to-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="card-surface border-[#89CFF3] p-8">
          <div className="text-center">
            <img
              src="/logo-unipma.png"
              alt="Logo UNIPUS"
              className="mx-auto mb-3 h-14 w-14 object-contain drop-shadow-sm"
            />
            <h1 className="text-2xl font-extrabold text-slate-900">Masuk ke Unipus</h1>
            <p className="mt-1 text-xs text-slate-500">
              Akses katalog perpustakaan, Book Cart, dan dashboard peminjaman Anda
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@student.unipus.ac.id"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3">
              <LogIn className="h-4 w-4" />
              Masuk Sekarang
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-600">
            Belum memiliki akun anggota?{' '}
            <Link to="/register" className="font-bold text-[#00A9FF] hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
