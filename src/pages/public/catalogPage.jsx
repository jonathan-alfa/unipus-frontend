import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import BookCard from '../../components/books/bookCard';

const ITEMS_PER_PAGE = 8;

export default function CatalogPage() {
  const { books, categories } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'ALL'
  );
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('title_asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    if (qParam !== null) setSearchTerm(qParam);
    if (catParam !== null) setSelectedCategory(catParam);
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return books
      .filter((b) => b.is_active !== false && b.coded_count > 0)
      .filter((book) => {
        const matchesQuery =
          !q ||
          book.title.toLowerCase().includes(q) ||
          (book.author && book.author.toLowerCase().includes(q)) ||
          book.category_name.toLowerCase().includes(q) ||
          (book.isbn && book.isbn.toLowerCase().includes(q)) ||
          (Array.isArray(book.copies) &&
            book.copies.some(
              (c) => c.copy_code && c.copy_code.toLowerCase().includes(q)
            ));

        const matchesCategory =
          selectedCategory === 'ALL' ||
          Number(book.category_id) === Number(selectedCategory);

        const matchesAvailability =
          availabilityFilter === 'ALL' ||
          (availabilityFilter === 'AVAILABLE' && book.available_stock > 0) ||
          (availabilityFilter === 'OUT_OF_STOCK' && book.available_stock <= 0);

        return matchesQuery && matchesCategory && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
        if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
        if (sortBy === 'year_desc') return b.publication_year - a.publication_year;
        if (sortBy === 'year_asc') return a.publication_year - b.publication_year;
        return 0;
      });
  }, [books, searchTerm, selectedCategory, availabilityFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / ITEMS_PER_PAGE));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setAvailabilityFilter('ALL');
    setSortBy('title_asc');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[#89CFF3] bg-gradient-to-r from-[#CDF5FD] via-[#A0E9FF]/40 to-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-[#00A9FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Katalog Koleksi Perpustakaan
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Jelajahi Katalog Buku Unipus
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Temukan buku berdasarkan judul, penulis, atau kategori, lalu tambahkan ke{' '}
            <strong>Book Cart</strong> untuk diajukan peminjamannya.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Input */}
          <div className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00A9FF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, penulis, kategori, atau ISBN..."
              className="input-field pl-10"
            />
          </div>

          {/* Category Select */}
          <div className="relative lg:col-span-3">
            <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-10"
            >
              <option value="ALL">Semua Kategori ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Select */}
          <div className="lg:col-span-2">
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="AVAILABLE">Tersedia</option>
              <option value="OUT_OF_STOCK">Stok Habis</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="relative lg:col-span-2">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-9"
            >
              <option value="title_asc">Judul (A - Z)</option>
              <option value="title_desc">Judul (Z - A)</option>
              <option value="year_desc">Tahun Terbaru</option>
              <option value="year_asc">Tahun Terlama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-semibold text-slate-600">
          Menampilkan <strong className="text-slate-900">{paginatedBooks.length}</strong> dari{' '}
          <strong className="text-slate-900">{filteredBooks.length}</strong> buku yang ditemukan
        </p>

        {(searchTerm || selectedCategory !== 'ALL' || availabilityFilter !== 'ALL') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A9FF] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filter Pencarian
          </button>
        )}
      </div>

      {/* Book Grid */}
      {paginatedBooks.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Buku Tidak Ditemukan
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Tidak ada buku yang cocok dengan kata kunci atau filter yang Anda pilih. Coba gunakan kata kunci lain.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-primary mt-5"
          >
            Tampilkan Semua Buku
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {paginatedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination (NFR 8.2) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="btn-outline px-3 py-2 text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 rounded-xl text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#00A9FF] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-[#CDF5FD]/50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="btn-outline px-3 py-2 text-xs"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
