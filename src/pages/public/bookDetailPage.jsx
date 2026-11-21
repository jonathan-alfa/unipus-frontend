import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  User,
  Building2,
  Calendar,
  Hash,
  Layers,
  ShoppingBag,
  Check,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useCart } from '../../context/cartContext';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import StockBadge from '../../components/common/stockBadge';
import BookCard from '../../components/books/bookCard';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, settings, createLoanRequest } = useLibrary();
  const { addToCart, isInCart, openCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [directNotes, setDirectNotes] = useState('');
  const [showDirectModal, setShowDirectModal] = useState(false);

  const book = books.find((b) => b.id === Number(id));

  if (!book) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Buku Tidak Ditemukan</h2>
        <p className="mt-2 text-sm text-slate-500">
          Buku yang Anda cari tidak terdaftar atau telah dihapus dari katalog.
        </p>
        <Link to="/books" className="btn-primary mt-5">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const inCart = isInCart(book.id);
  const isAvailable = Number(book.available_stock) > 0;
  const relatedBooks = books
    .filter(
      (b) =>
        b.category_id === book.category_id &&
        b.id !== book.id &&
        b.is_active !== false &&
        b.coded_count > 0
    )
    .slice(0, 4);

  const handleDirectBorrow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk mengajukan peminjaman.', 'info');
      navigate('/login');
      return;
    }

    const result = await createLoanRequest({
      bookIds: [book.id],
      notes: directNotes,
    });

    if (result.success) {
      showToast(result.message, 'success', 'Pengajuan Terkirim!');
      setShowDirectModal(false);
      navigate('/my-requests');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#00A9FF]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Halaman Sebelumnya
        </button>
      </div>

      {/* Main Book Detail Card */}
      <div className="card-surface overflow-hidden border-[#89CFF3] p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Book Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/40 shadow-glow">
              <img
                src={book.cover_image}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Metadata & Actions */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-[#CDF5FD] px-3 py-1 text-xs font-bold text-[#0088CC]">
                  {book.category_name}
                </span>
                <StockBadge
                  availableStock={book.available_stock}
                  totalStock={book.total_stock}
                />
              </div>

              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {book.title}
              </h1>

              <p className="mt-1 text-sm font-semibold text-[#0088CC]">
                Oleh {book.author}
              </p>

              {/* Metadata Grid (PRD 6.2) */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/30 p-4 sm:grid-cols-4">
                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
                    <Building2 className="h-3.5 w-3.5 text-[#00A9FF]" />
                    Penerbit
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">{book.publisher}</p>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-[#00A9FF]" />
                    Tahun Terbit
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {book.publication_year}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
                    <Hash className="h-3.5 w-3.5 text-[#00A9FF]" />
                    ISBN
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {book.isbn || '-'}
                  </p>
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-400">
                    <Layers className="h-3.5 w-3.5 text-[#00A9FF]" />
                    Ketersediaan Stok
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {book.available_stock} dari {book.total_stock} Eksemplar
                  </p>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900">Sinopsis & Deskripsi Buku</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {book.synopsis}
                </p>
              </div>
            </div>

            {/* Borrowing Action Buttons */}
            {!isAdmin && (
              <div className="border-t border-slate-100 pt-6">
                {!isAvailable ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                    Maaf, seluruh stok eksemplar buku ini sedang dipinjam. Anda hanya dapat mengajukan peminjaman apabila stok tersedia.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {inCart ? (
                      <button
                        type="button"
                        onClick={openCart}
                        className="btn-secondary flex-1 py-3"
                      >
                        <Check className="h-4 w-4 text-[#00A9FF]" />
                        Sudah di Book Cart (Lihat Keranjang)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(book)}
                        className="btn-secondary flex-1 py-3"
                      >
                        <ShoppingBag className="h-4 w-4 text-[#00A9FF]" />
                        + Masukkan ke Book Cart
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          showToast('Silakan login terlebih dahulu untuk meminjam buku.', 'info');
                          navigate('/login');
                        } else {
                          setShowDirectModal(true);
                        }
                      }}
                      className="btn-primary flex-1 py-3"
                    >
                      <Sparkles className="h-4 w-4" />
                      Ajukan Peminjaman Langsung
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="mb-6 text-xl font-extrabold text-slate-900">
            Buku Terkait dalam Kategori {book.category_name}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {relatedBooks.map((rel) => (
              <BookCard key={rel.id} book={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Direct Borrow Modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowDirectModal(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#89CFF3] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">
              Konfirmasi Pengajuan Peminjaman
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Anda akan mengajukan peminjaman buku berikut untuk durasi{' '}
              <strong>{settings.defaultLoanDurationDays} hari</strong>.
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/40 p-3">
              <img
                src={book.cover_image}
                alt={book.title}
                className="h-16 w-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{book.title}</p>
                <p className="text-xs text-slate-600">{book.author}</p>
              </div>
            </div>

            <form onSubmit={handleDirectBorrow} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Catatan Keperluan Peminjaman
                </label>
                <textarea
                  rows={3}
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                  placeholder="Contoh: Referensi mata kuliah / penelitian..."
                  className="input-field text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
