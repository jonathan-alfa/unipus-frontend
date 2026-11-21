import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  Hash,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';
import StockBadge from '../../components/common/stockBadge';

const INITIAL_FORM = {
  title: '',
  author: '',
  publisher: '',
  publication_year: new Date().getFullYear(),
  category_id: '',
  isbn: '',
  total_stock: 3,
  available_stock: 0,
  cover_book: '',
  coverFile: null,
  previewUrl: '',
  synopsis: '',
  is_active: true,
};

export default function ManageBooksPage() {
  const {
    books,
    categories,
    addBook,
    updateBook,
    deleteBook,
    assignBookCopyCodes,
    updateSingleBookCopy,
  } = useLibrary();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal for inputting / managing individual book copy codes (`book_copies`)
  const [codesModalBookId, setCodesModalBookId] = useState(null);
  const [singleCodeInput, setSingleCodeInput] = useState('');
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [editingCopyId, setEditingCopyId] = useState(null);
  const [editingCopyCode, setEditingCopyCode] = useState('');
  const [editingCopyStatus, setEditingCopyStatus] = useState('available');

  const activeCodesBook = codesModalBookId
    ? books.find((b) => b.id === Number(codesModalBookId))
    : null;

  const incompleteBooksCount = books.filter((b) => Number(b.pending_count) > 0).length;

  const filteredBooks = books.filter((b) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q)) ||
      (Array.isArray(b.copies) &&
        b.copies.some((c) => c.copy_code && c.copy_code.toLowerCase().includes(q)));
    const matchesCat =
      categoryFilter === 'ALL' || Number(b.category_id) === Number(categoryFilter);
    const matchesCatalogStatus =
      catalogStatusFilter === 'ALL' ||
      (catalogStatusFilter === 'PUBLISHED' && Number(b.coded_count) > 0) ||
      (catalogStatusFilter === 'PENDING_CODE' && Number(b.pending_count) > 0) ||
      (catalogStatusFilter === 'NOT_IN_CATALOG' && Number(b.coded_count) === 0);

    return matchesSearch && matchesCat && matchesCatalogStatus;
  });

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      ...INITIAL_FORM,
      category_id: categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      category_id: book.category_id || '',
      isbn: book.isbn || '',
      total_stock: book.total_stock,
      available_stock: book.available_stock,
      cover_book: book.cover_book || book.cover_image || '',
      coverFile: null,
      previewUrl: book.cover_book || book.cover_image || '',
      synopsis: book.synopsis || '',
      is_active: book.is_active !== false,
    });
    setModalOpen(true);
  };

  const openCodesModal = (book) => {
    setCodesModalBookId(book.id);
    setSingleCodeInput('');
    setEditingCopyId(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Format gambar harus berupa JPEG, PNG, WEBP, atau JPG.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5 MB.', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      coverFile: file,
      previewUrl: objectUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.total_stock) < 1) {
      showToast('Total stok buku minimal harus 1 eksemplar.', 'error');
      return;
    }

    setIsSubmitting(true);
    if (editingBook) {
      const res = await updateBook(editingBook.id, formData);
      setIsSubmitting(false);
      if (res.success) {
        showToast(res.message, 'success');
        setModalOpen(false);
      } else {
        showToast(res.message, 'error');
      }
    } else {
      const res = await addBook(formData);
      setIsSubmitting(false);
      if (res.success) {
        showToast(res.message, 'success', 'Buku Tersimpan ke Database');
        setModalOpen(false);
        // Automatically open the Copy Code Input Modal for the newly created book
        if (res.book?.id) {
          setCodesModalBookId(res.book.id);
          setSingleCodeInput('');
        }
      } else {
        showToast(res.message, 'error');
      }
    }
  };

  const handleDelete = async (book) => {
    const result = await deleteBook(book.id);
    if (result.success) {
      showToast(result.message, 'info');
    } else {
      showToast(result.message, 'error', 'Tidak Dapat Menghapus');
    }
  };

  // Input 1 book code at a time (one-by-one workflow)
  const handleAddSingleCode = async (e) => {
    e.preventDefault();
    if (!activeCodesBook) return;
    const trimmed = singleCodeInput.trim();
    if (!trimmed) {
      showToast('Masukkan kode buku terlebih dahulu.', 'error');
      return;
    }

    setIsSavingCode(true);
    const res = await assignBookCopyCodes(activeCodesBook.id, [trimmed]);
    setIsSavingCode(false);

    if (res.success) {
      showToast(`Kode buku "${trimmed}" berhasil ditambahkan!`, 'success');
      setSingleCodeInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleStartEditCopy = (copy) => {
    setEditingCopyId(copy.id);
    setEditingCopyCode(copy.copy_code || '');
    setEditingCopyStatus(copy.status === 'pending_code' ? 'available' : copy.status);
  };

  const handleSaveEditCopy = async (copyId) => {
    const res = await updateSingleBookCopy(copyId, {
      copy_code: editingCopyCode,
      status: editingCopyStatus,
    });
    if (res.success) {
      showToast(res.message, 'success');
      setEditingCopyId(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  const COPY_STATUS_LABELS = {
    available: { label: 'Tersedia', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    borrowed: { label: 'Sedang Dipinjam', cls: 'bg-[#CDF5FD] text-[#0088CC] border-[#89CFF3]' },
    maintenance: { label: 'Pemeliharaan', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    lost: { label: 'Hilang', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
    pending_code: { label: 'Belum Ada Kode', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Manajemen Data Buku & Kode Eksemplar
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Tambah data buku ke database, lalu input kode buku satu per satu agar buku aktif dan tampil di katalog web.
          </p>
        </div>
        <button type="button" onClick={openAddModal} className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Buku Baru
        </button>
      </div>

      {/* Info Banner about Book Code Workflow */}
      {incompleteBooksCount > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-extrabold">
                Terdapat {incompleteBooksCount} judul buku yang masih memiliki eksemplar belum berkode
              </p>
              <p className="mt-0.5 text-amber-800">
                Buku baru yang belum memiliki kode buku tidak akan tampil di katalog pengguna. Klik tombol{' '}
                <strong>Input Kode Buku</strong> pada tabel di bawah untuk memasukkan kode eksemplar satu per satu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setCatalogStatusFilter(
                catalogStatusFilter === 'PENDING_CODE' ? 'ALL' : 'PENDING_CODE'
              )
            }
            className="shrink-0 rounded-xl border border-amber-400 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            {catalogStatusFilter === 'PENDING_CODE'
              ? 'Tampilkan Semua Buku'
              : 'Filter Buku Belum Lengkap Kode'}
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="card-surface p-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul buku, penulis, ISBN, atau kode eksemplar..."
            className="input-field pl-10"
          />
        </div>
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <select
            value={catalogStatusFilter}
            onChange={(e) => setCatalogStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="ALL">Semua Status Katalog</option>
            <option value="PUBLISHED">Sudah Tampil di Katalog</option>
            <option value="NOT_IN_CATALOG">Belum Masuk Katalog (0 Kode)</option>
            <option value="PENDING_CODE">Masih Ada Stok Belum Berkode</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Informasi Buku</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Status Katalog & Kode Buku</th>
                <th className="px-5 py-3.5">Stok Tersedia</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data buku yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const codedCount = Number(book.coded_count) || 0;
                  const pendingCount = Number(book.pending_count) || 0;
                  const isInCatalog = book.is_active !== false && codedCount > 0;

                  return (
                    <tr key={book.id} className="hover:bg-[#CDF5FD]/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={book.cover_book || book.cover_image}
                            alt={book.title}
                            className="h-14 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                              {book.title}
                            </p>
                            <p className="text-slate-500">
                              {book.author || '-'} • {book.publisher || '-'} ({book.publication_year || '-'})
                            </p>
                            {book.isbn && (
                              <span className="font-mono text-[10px] text-slate-400">
                                ISBN: {book.isbn}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-[#CDF5FD] px-2.5 py-1 text-[11px] font-bold text-[#0088CC]">
                          {book.category_name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          {isInCatalog ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Tampil di Katalog Web
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Belum Tampil (Wajib Input Kode)
                            </span>
                          )}

                          <span className="text-[11px] font-semibold text-slate-600">
                            Kode Terinput:{' '}
                            <strong className="text-slate-900">
                              {codedCount} / {book.total_stock}
                            </strong>{' '}
                            Eksemplar
                            {pendingCount > 0 && (
                              <span className="ml-1 text-amber-700">
                                ({pendingCount} belum berkode)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StockBadge
                          availableStock={book.available_stock}
                          totalStock={book.total_stock}
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openCodesModal(book)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                              pendingCount > 0
                                ? 'bg-[#00A9FF] text-white shadow-xs hover:bg-[#0088CC]'
                                : 'border border-[#89CFF3] bg-[#CDF5FD]/60 text-[#0088CC] hover:bg-[#A0E9FF]'
                            }`}
                            title="Input atau Kelola Kode Buku Satu per Satu"
                          >
                            <Hash className="h-3.5 w-3.5" />
                            {pendingCount > 0
                              ? `Input Kode (${pendingCount})`
                              : 'Kelola Kode'}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(book)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-[#00A9FF] hover:text-[#00A9FF]"
                            title="Edit Informasi Buku"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(book)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                            title="Hapus Buku"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: INPUT & KELOLA KODE BUKU SATU PER SATU (`book_copies`)
         ===================================================================== */}
      {activeCodesBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCodesModalBookId(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-[#89CFF3] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#A0E9FF] bg-gradient-to-r from-[#CDF5FD] to-white px-6 py-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Input & Kelola Kode Eksemplar Buku
                </h3>
                <p className="text-xs font-semibold text-[#0088CC] line-clamp-1">
                  {activeCodesBook.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCodesModalBookId(null)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
              {/* Summary Status Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-center">
                  <p className="text-xs font-semibold text-slate-500">Total Stok Buku</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {activeCodesBook.total_stock}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-center">
                  <p className="text-xs font-semibold text-emerald-700">Sudah Berkode</p>
                  <p className="mt-1 text-xl font-extrabold text-emerald-800">
                    {activeCodesBook.coded_count || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 text-center">
                  <p className="text-xs font-semibold text-amber-700">Belum Berkode</p>
                  <p className="mt-1 text-xl font-extrabold text-amber-800">
                    {activeCodesBook.pending_count || 0}
                  </p>
                </div>
              </div>

              {/* One-by-One Code Input Form */}
              {Number(activeCodesBook.pending_count) > 0 ? (
                <form
                  onSubmit={handleAddSingleCode}
                  className="rounded-2xl border border-[#89CFF3] bg-[#CDF5FD]/35 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-900">
                      Input Kode Buku Satu per Satu (Sisa {activeCodesBook.pending_count} Eksemplar Belum Berkode)
                    </label>
                    <span className="rounded-full bg-[#00A9FF] px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Eksemplar Ke-{(Number(activeCodesBook.coded_count) || 0) + 1}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                      <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#00A9FF]" />
                      <input
                        type="text"
                        value={singleCodeInput}
                        onChange={(e) => setSingleCodeInput(e.target.value)}
                        placeholder="Masukkan kode unik buku (Contoh: 005.1-CLN-001)..."
                        className="input-field pl-10 font-mono text-xs"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingCode}
                      className="btn-primary shrink-0 px-5 py-2.5 text-xs"
                    >
                      <Plus className="h-4 w-4" />
                      {isSavingCode ? 'Menyimpan...' : 'Simpan Kode Ini'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Begitu minimal 1 kode buku disimpan, buku ini akan otomatis aktif dan tampil di halaman katalog pengguna.
                  </p>
                </form>
              ) : (
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  Seluruh eksemplar buku ini ({activeCodesBook.total_stock} buku) sudah memiliki kode unik dan sudah tampil di katalog web!
                </div>
              )}

              {/* List of All Physical Copies (`copies`) */}
              <div>
                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Daftar Seluruh Eksemplar Buku ({activeCodesBook.copies?.length || 0} Unit)
                </h4>

                <div className="space-y-2">
                  {(activeCodesBook.copies || []).map((copy, idx) => {
                    const statusMeta =
                      COPY_STATUS_LABELS[copy.status] || COPY_STATUS_LABELS.pending_code;
                    const isEditingThis = editingCopyId === copy.id;

                    return (
                      <div
                        key={copy.id || idx}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#CDF5FD] text-xs font-extrabold text-[#0088CC]">
                            #{idx + 1}
                          </span>

                          {isEditingThis ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                value={editingCopyCode}
                                onChange={(e) => setEditingCopyCode(e.target.value)}
                                placeholder="Masukkan kode buku..."
                                className="input-field py-1.5 px-3 font-mono text-xs w-44"
                              />
                              <select
                                value={editingCopyStatus}
                                onChange={(e) => setEditingCopyStatus(e.target.value)}
                                className="input-field py-1.5 px-2.5 text-xs w-36"
                              >
                                <option value="available">Tersedia</option>
                                <option value="maintenance">Pemeliharaan</option>
                                <option value="lost">Hilang</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              {copy.copy_code ? (
                                <span className="font-mono text-sm font-extrabold text-slate-900">
                                  {copy.copy_code}
                                </span>
                              ) : (
                                <span className="italic text-xs text-slate-400">
                                  Belum diberi kode buku
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusMeta.cls}`}
                          >
                            {statusMeta.label}
                          </span>

                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditCopy(copy.id)}
                                className="btn-primary px-3 py-1.5 text-xs"
                              >
                                <Save className="h-3.5 w-3.5" />
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCopyId(null)}
                                className="btn-outline px-2.5 py-1.5 text-xs"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            copy.copy_code &&
                            copy.status !== 'borrowed' && (
                              <button
                                type="button"
                                onClick={() => handleStartEditCopy(copy)}
                                className="btn-outline px-2.5 py-1 text-[11px]"
                              >
                                <Edit3 className="h-3 w-3" />
                                Ubah Kode
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setCodesModalBookId(null)}
                className="btn-outline"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: TAMBAH / EDIT INFORMASI BUKU
         ===================================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-[#89CFF3] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#A0E9FF] bg-gradient-to-r from-[#CDF5FD] to-white px-6 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingBook ? 'Edit Informasi Buku' : 'Tambah Buku Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="max-h-[78vh] overflow-y-auto p-6 space-y-4"
            >
              {!editingBook && (
                <div className="rounded-2xl border border-[#89CFF3] bg-[#CDF5FD]/40 p-3.5 text-xs text-slate-700">
                  <strong>Alur Penambahan Buku:</strong> Setelah menyimpan data buku di bawah ini, Anda akan langsung diarahkan untuk menginput <strong>Kode Buku</strong> satu per satu sesuai jumlah stok agar buku tampil di katalog web.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nama Penulis *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, author: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Kategori Buku
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        category_id: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    className="input-field"
                  >
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Penerbit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.publisher}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, publisher: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Tahun Terbit *
                  </label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2035}
                    value={formData.publication_year}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        publication_year: Number(e.target.value),
                      }))
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nomor ISBN (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, isbn: e.target.value }))
                    }
                    placeholder="978-xxxx-xxxx"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Jumlah Total Eksemplar (Total Stok) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.total_stock}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value));
                      setFormData((p) => ({
                        ...p,
                        total_stock: val,
                      }));
                    }}
                    className="input-field"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3 rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/25 p-4">
                  <label className="block text-xs font-bold text-slate-800">
                    Sampul / Cover Buku (Upload File Gambar atau Masukkan URL)
                  </label>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {(formData.previewUrl || formData.cover_book) && (
                      <img
                        src={formData.previewUrl || formData.cover_book}
                        alt="Preview Cover"
                        className="h-24 w-16 shrink-0 rounded-xl border border-[#89CFF3] object-cover shadow-xs bg-white"
                      />
                    )}

                    <div className="flex-1 space-y-2.5">
                      <div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#00A9FF] bg-white px-3.5 py-2 text-xs font-bold text-[#0088CC] shadow-2xs transition-colors hover:bg-[#CDF5FD]/60">
                          <Upload className="h-3.5 w-3.5 text-[#00A9FF]" />
                          <span>
                            {formData.coverFile
                              ? `File Terpilih: ${formData.coverFile.name}`
                              : 'Pilih File Gambar Cover (JPEG/PNG/WEBP, Maks 5MB)'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {formData.coverFile && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                coverFile: null,
                                previewUrl: p.cover_book || '',
                              }))
                            }
                            className="ml-3 text-[11px] font-bold text-rose-600 hover:underline"
                          >
                            Hapus File
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="url"
                          value={formData.cover_book}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              cover_book: e.target.value,
                              previewUrl: p.coverFile ? p.previewUrl : e.target.value,
                            }))
                          }
                          placeholder="Atau tempel URL gambar cover (https://...)"
                          className="input-field text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Sinopsis Buku *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.synopsis}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, synopsis: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>

                {editingBook && (
                  <div className="sm:col-span-2 flex items-center gap-2.5 pt-1">
                    <input
                      id="book-is-active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, is_active: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#00A9FF] focus:ring-[#00A9FF]"
                    />
                    <label
                      htmlFor="book-is-active"
                      className="text-xs font-bold text-slate-700"
                    >
                      Tampilkan Buku Secara Aktif di Katalog
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingBook
                    ? 'Simpan Perubahan'
                    : 'Simpan & Lanjut Input Kode Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
