import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Layers,
  Target,
  Compass,
  Award,
  ShoppingBag,
  Globe,
} from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';
import BookCard from '../../components/books/bookCard';

export default function LandingPage() {
  const { books, categories } = useLibrary();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const totalAvailableStock = books.reduce(
    (sum, b) => sum + Number(b.available_stock || 0),
    0
  );
  // Show partial catalog preview (4 books) on the landing page
  const previewBooks = books.slice(0, 4);

  const handleCatalogAccess = (targetUrl = '/books') => {
    if (!isAuthenticated) {
      showToast(
        'Silakan login terlebih dahulu untuk mengakses halaman katalog buku.',
        'info'
      );
      navigate('/login', { state: { from: { pathname: targetUrl } } });
      return;
    }
    navigate(targetUrl);
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const targetUrl = searchQuery.trim()
      ? `/books?q=${encodeURIComponent(searchQuery.trim())}`
      : '/books';
    handleCatalogAccess(targetUrl);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* =====================================================================
          1. SECTION HOME (#home) — Penjelasan Singkatan UNIPUS & 3D Logo UNIPMA
         ===================================================================== */}
      <section
        id="home"
        className="relative scroll-mt-16 overflow-hidden border-b border-[#A0E9FF] bg-gradient-to-br from-[#CDF5FD] via-[#A0E9FF]/35 to-white py-14 lg:py-20"
      >
        {/* Ambient Decorative Glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#89CFF3]/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#00A9FF]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* Left Column: Explanation of UNIPUS (UNIPMA Perpustakaan) */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#89CFF3] bg-white/90 px-4 py-1.5 text-xs font-bold text-[#0088CC] shadow-xs">
                UNIPUS — UNIPMA Perpustakaan
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:leading-[1.15]">
                Selamat Datang di{' '}
                <span className="bg-gradient-to-r from-[#00A9FF] to-[#0077B6] bg-clip-text text-transparent">
                  UNIPUS
                </span>
                <span className="mt-1 block text-2xl sm:text-3xl font-bold text-slate-800">
                  (UNIPMA Perpustakaan)
                </span>
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base max-w-2xl mx-auto lg:mx-0">
                <strong>UNIPUS</strong> merupakan singkatan dari{' '}
                <strong>UNIPMA Perpustakaan</strong>, yaitu platform layanan perpustakaan digital berbasis web milik{' '}
                <strong>Universitas PGRI Madiun (UNIPMA)</strong>. Hadir untuk memudahkan mahasiswa dan sivitas akademika dalam mencari referensi buku, memantau ketersediaan stok, serta mengajukan peminjaman dan pengembalian buku secara online.
              </p>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-7 flex flex-col gap-2 rounded-2xl border border-[#89CFF3] bg-white p-2 shadow-glow sm:flex-row max-w-xl mx-auto lg:mx-0"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#00A9FF]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul buku, penulis, atau ISBN..."
                    className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary px-6 py-3 text-sm">
                  Cari Buku
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Quick Stats Row */}
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="rounded-2xl border border-[#89CFF3]/70 bg-white/85 p-3 text-center lg:text-left">
                  <p className="text-lg sm:text-xl font-extrabold text-[#00A9FF]">
                    {books.length}+ Judul
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">Koleksi Buku</p>
                </div>
                <div className="rounded-2xl border border-[#89CFF3]/70 bg-white/85 p-3 text-center lg:text-left">
                  <p className="text-lg sm:text-xl font-extrabold text-[#0088CC]">
                    {totalAvailableStock} Buku
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">Stok Tersedia</p>
                </div>
                <div className="rounded-2xl border border-[#89CFF3]/70 bg-white/85 p-3 text-center lg:text-left">
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {categories.length} Kategori
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">Bidang Ilmu</p>
                </div>
              </div>
            </div>

            {/* Right Column: 3D UNIPUS / UNIPMA Logo Showcase */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div
                className="relative flex items-center justify-center py-6"
                style={{ perspective: '1100px' }}
              >
                {/* Outer 3D Glow Halo */}
                <div className="pointer-events-none absolute h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-[#00A9FF]/35 via-[#89CFF3]/40 to-[#CDF5FD] blur-2xl" />

                {/* 3D Tilted Pedestal Card */}
                <div className="logo-3d-float relative z-10 flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-white/90 bg-gradient-to-b from-white/95 via-[#CDF5FD]/80 to-[#A0E9FF]/70 p-8 sm:p-10 shadow-[0_28px_60px_-12px_rgba(0,169,255,0.45),0_12px_24px_-8px_rgba(15,23,42,0.18),inset_0_2px_12px_rgba(255,255,255,0.9)] backdrop-blur-md">
                  {/* Inner 3D Ring */}
                  <div className="relative flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center rounded-full bg-gradient-to-br from-white via-[#CDF5FD] to-[#89CFF3]/50 p-5 shadow-[inset_0_4px_16px_rgba(0,169,255,0.2),0_15px_35px_rgba(0,136,204,0.25)]">
                    <img
                      src="/logo-unipma.png"
                      alt="Logo 3D UNIPUS - Universitas PGRI Madiun"
                      className="h-40 w-40 sm:h-48 sm:w-48 object-contain drop-shadow-[0_18px_20px_rgba(15,23,42,0.35)] transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* 3D Pedestal Label */}
                  <div className="mt-5 text-center">
                    <span className="inline-block rounded-full bg-[#00A9FF] px-4 py-1 text-xs font-extrabold tracking-wider text-white shadow-sm">
                      UNIPUS • UNIPMA
                    </span>
                    <p className="mt-1.5 text-xs font-bold text-slate-700">
                      Universitas PGRI Madiun
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SECTION TENTANG WEBSITE UNIPUS (#tentang)
         ===================================================================== */}
      <section id="tentang" className="scroll-mt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#89CFF3] bg-white p-6 sm:p-10 shadow-soft">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-[#CDF5FD] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0088CC]">
              Tentang Platform Kami
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Tentang Website UNIPUS
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              <strong>UNIPUS (UNIPMA Perpustakaan)</strong> adalah sistem informasi manajemen perpustakaan berbasis web yang dirancang khusus untuk mendigitalisasi proses sirkulasi buku di lingkungan Universitas PGRI Madiun. Melalui UNIPUS, seluruh proses mulai dari pencarian literatur, pengecekan stok, pengajuan peminjaman melalui <em>Book Cart</em>, hingga pengembalian buku tercatat secara terstruktur dan transparan.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Compass,
                title: 'Katalog Digital Terpusat',
                desc: 'Memudahkan pencarian informasi buku berdasarkan judul, penulis, kategori bidang ilmu, maupun nomor ISBN secara real-time.',
              },
              {
                icon: ShoppingBag,
                title: 'Fitur Book Cart Praktis',
                desc: 'Pilih beberapa buku sekaligus ke dalam keranjang peminjaman (Book Cart) dan ajukan dalam satu kali transaksi.',
              },
              {
                icon: Clock,
                title: 'Pelacakan Status Transparan',
                desc: 'Pantau status pengajuan mulai dari Pending, Disetujui (Borrowed), batas waktu kembali, hingga konfirmasi pengembalian.',
              },
              {
                icon: ShieldCheck,
                title: 'Manajemen Stok Otomatis',
                desc: 'Stok buku diperbarui secara akurat saat peminjaman disetujui maupun setelah pengembalian dikonfirmasi oleh petugas Admin.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#A0E9FF] bg-gradient-to-b from-[#CDF5FD]/40 to-white p-5 transition-all hover:border-[#00A9FF] hover:shadow-soft"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A9FF] text-white shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SECTION VISI & MISI PERPUSTAKAAN UNIPMA (#visi-misi)
         ===================================================================== */}
      <section id="visi-misi" className="scroll-mt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#CDF5FD] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0088CC]">
            Komitmen Layanan Akademik
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Visi & Misi Perpustakaan UNIPMA
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Landasan pelayanan UPT Perpustakaan Universitas PGRI Madiun dalam mendukung Tri Dharma Perguruan Tinggi
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Visi Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-[#89CFF3] bg-gradient-to-br from-[#00A9FF] via-[#0088CC] to-slate-900 p-7 sm:p-8 text-white shadow-glow">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#CDF5FD] backdrop-blur-xs">
                <Target className="h-4 w-4" />
                Visi Perpustakaan UNIPMA
              </div>
              <h3 className="mt-5 text-xl sm:text-2xl font-extrabold leading-snug">
                &ldquo;Menjadi pusat layanan informasi, literasi, dan sumber belajar berbasis teknologi informasi yang unggul, modern, dan terintegrasi untuk mendukung Tri Dharma Perguruan Tinggi di Universitas PGRI Madiun.&rdquo;
              </h3>
            </div>

            <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5">
              <img
                src="/logo-unipma.png"
                alt="Logo UNIPMA"
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="text-xs font-extrabold text-white">
                  UPT Perpustakaan UNIPMA
                </p>
                <p className="text-[11px] text-[#CDF5FD]">
                  Smart, Modern & Accessible Library
                </p>
              </div>
            </div>
          </div>

          {/* Misi Card */}
          <div className="lg:col-span-7 rounded-3xl border border-[#89CFF3] bg-gradient-to-br from-[#CDF5FD]/50 via-white to-[#A0E9FF]/25 p-7 sm:p-8 shadow-soft">
            <div className="inline-flex items-center gap-2 rounded-xl bg-[#CDF5FD] px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0088CC]">
              <Award className="h-4 w-4 text-[#00A9FF]" />
              Misi Perpustakaan UNIPMA
            </div>

            <div className="mt-5 space-y-4">
              {[
                'Menyediakan dan mengembangkan koleksi bahan pustaka cetak maupun digital yang berkualitas serta relevan dengan kebutuhan pendidikan, penelitian, dan pengabdian kepada masyarakat.',
                'Menyelenggarakan layanan sirkulasi peminjaman dan pengembalian buku berbasis teknologi informasi (UNIPUS) yang cepat, mudah, akurat, dan transparan.',
                'Meningkatkan budaya baca dan literasi informasi bagi mahasiswa, dosen, serta seluruh sivitas akademika Universitas PGRI Madiun.',
                'Mengelola tata kelola katalog, ketersediaan stok, dan pengarsipan transaksi perpustakaan secara profesional, terstruktur, serta akuntabel.',
              ].map((misi, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3.5 rounded-2xl border border-[#A0E9FF] bg-white p-4 shadow-2xs"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#00A9FF] text-xs font-extrabold text-white">
                    0{index + 1}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
                    {misi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SECTION KATALOG BUKU PREVIEW (#katalog) + BUTTON VIEW ALL
         ===================================================================== */}
      <section id="katalog" className="scroll-mt-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full bg-[#CDF5FD] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0088CC]">
              Koleksi Pustaka Pilihan
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Katalog Buku UNIPUS
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Menampilkan sebagian koleksi buku perpustakaan. Klik <strong>View All</strong> untuk menjelajahi seluruh katalog buku.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCatalogAccess('/books')}
            className="btn-secondary self-start sm:self-auto"
          >
            View All Katalog ({books.length})
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {previewBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Centered View All Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => handleCatalogAccess('/books')}
            className="btn-primary px-8 py-3.5 text-sm shadow-glow"
          >
            <BookOpen className="h-4 w-4" />
            View All — Lihat Seluruh Katalog Buku ({books.length} Koleksi)
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
