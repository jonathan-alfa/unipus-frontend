import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  Trash2,
  Calendar,
  BookOpen,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/cartContext';
import { useLibrary } from '../../context/libraryContext';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import { addDaysToDate, formatDate } from '../../utils/formatDate';

export default function BookCartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    clearCart,
  } = useCart();
  const { settings, createLoanRequest } = useLibrary();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const estimatedDueDate = formatDate(
    addDaysToDate(new Date().toISOString(), settings.defaultLoanDurationDays)
  );

  const handleSubmitLoan = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk mengajukan peminjaman.', 'info');
      closeCart();
      navigate('/login');
      return;
    }

    if (isAdmin) {
      showToast('Akun Admin tidak dapat mengajukan peminjaman buku.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await createLoanRequest({
      bookIds: cartItems.map((b) => b.id),
      notes,
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast(result.message, 'success', 'Pengajuan Berhasil!');
      clearCart();
      setNotes('');
      closeCart();
      navigate('/my-requests');
    } else {
      showToast(result.message, 'error', 'Gagal Mengajukan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#A0E9FF] bg-gradient-to-r from-[#CDF5FD] to-white px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A9FF] text-white shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Book Cart Peminjaman</h2>
                <p className="text-xs font-medium text-slate-600">
                  {cartItems.length} dari maks. {settings.maxBooksPerLoan} buku dipilih
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#CDF5FD]/70 text-[#00A9FF]">
                  <BookOpen className="h-10 w-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Book Cart Masih Kosong
                </h3>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                  Pilih buku yang ingin Anda pinjam dari Katalog Buku untuk diajukan secara sekaligus.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/books');
                  }}
                  className="btn-primary mt-5"
                >
                  Jelajahi Katalog Buku
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Info Box */}
                <div className="rounded-2xl border border-[#89CFF3] bg-[#CDF5FD]/40 p-4">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#00A9FF]" />
                    <div className="text-xs leading-relaxed text-slate-700">
                      <p className="font-bold text-slate-900">Ketentuan Peminjaman Unipus:</p>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        <li>Durasi peminjaman standar: <strong>{settings.defaultLoanDurationDays} Hari</strong></li>
                        <li>Estimasi batas kembali: <strong>{estimatedDueDate}</strong></li>
                        <li>Stok buku akan dikurangi setelah disetujui Admin.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Selected Books List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Daftar Buku Pilihan
                    </span>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Kosongkan Semua
                    </button>
                  </div>

                  {cartItems.map((book, idx) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:border-[#89CFF3]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#CDF5FD] text-xs font-bold text-[#0088CC]">
                        {idx + 1}
                      </span>
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="h-16 w-12 shrink-0 rounded-lg object-cover bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {book.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">{book.author}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded-md bg-[#CDF5FD]/80 px-2 py-0.5 text-[10px] font-semibold text-[#0088CC]">
                            Qty: 1 Buku
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Sisa stok: {book.available_stock}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(book.id)}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Hapus dari Book Cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Loan Notes */}
                <form id="book-cart-form" onSubmit={handleSubmitLoan} className="space-y-3 pt-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">
                      Catatan / Keperluan Peminjaman (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Referensi Tugas Akhir / Praktikum Rekayasa Perangkat Lunak..."
                      className="input-field resize-none text-xs"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">Total Buku Diajukan</span>
                <span className="font-extrabold text-slate-900">
                  {cartItems.length} Eksemplar
                </span>
              </div>
              <button
                type="submit"
                form="book-cart-form"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                {isAuthenticated
                  ? 'Ajukan Peminjaman Sekarang'
                  : 'Login untuk Mengajukan Peminjaman'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
