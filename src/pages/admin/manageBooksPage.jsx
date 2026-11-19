import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
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
  total_stock: 5,
  available_stock: 5,
  cover_book: '',
  coverFile: null,
  previewUrl: '',
  synopsis: '',
  is_active: true,
};

export default function ManageBooksPage() {
  const { books, categories, addBook, updateBook, deleteBook } = useLibrary();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBooks = books.filter((b) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q));
    const matchesCat =
      categoryFilter === 'ALL' || Number(b.category_id) === Number(categoryFilter);
    return matchesSearch && matchesCat;
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

    if (Number(formData.total_stock) < 0 || Number(formData.available_stock) < 0) {
      showToast('Stok buku tidak boleh bernilai negatif.', 'error');
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
        showToast(res.message, 'success');
        setModalOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Data Buku</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Tambah koleksi buku baru, perbarui informasi dan sampul buku, serta kelola ketersediaan stok perpustakaan.
          </p>
        </div>
        <button type="button" onClick={openAddModal} className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Buku Baru
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card-surface p-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul buku, penulis, atau ISBN..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field sm:w-64"
        >
          <option value="ALL">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Books Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#A0E9FF] bg-[#CDF5FD]/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Informasi Buku</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Penerbit & Tahun</th>
                <th className="px-5 py-3.5">ISBN</th>
                <th className="px-5 py-3.5">Stok & Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBooks.map((book) => (
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
                        <p className="text-slate-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-[#CDF5FD] px-2.5 py-1 text-[11px] font-bold text-[#0088CC]">
                      {book.category_name}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {book.publisher} ({book.publication_year})
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-500">
                    {book.isbn || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <StockBadge
                        availableStock={book.available_stock}
                        totalStock={book.total_stock}
                      />
                      <span
                        className={`text-[10px] font-bold ${
                          book.is_active !== false
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {book.is_active !== false ? '● Aktif di Katalog' : '● Nonaktif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(book)}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-[#00A9FF] hover:text-[#00A9FF]"
                        title="Edit Buku"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Total Stok *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.total_stock}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setFormData((p) => ({
                          ...p,
                          total_stock: val,
                          available_stock: editingBook
                            ? Math.min(p.available_stock, val)
                            : val,
                        }));
                      }}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      Stok Tersedia *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={formData.total_stock}
                      value={formData.available_stock}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          available_stock: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-3 rounded-2xl border border-[#A0E9FF] bg-[#CDF5FD]/25 p-4">
                  <label className="block text-xs font-bold text-slate-800">
                    Sampul / Cover Buku (Upload File Gambar atau Masukkan URL)
                  </label>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Preview Image */}
                    {(formData.previewUrl || formData.cover_book) && (
                      <img
                        src={formData.previewUrl || formData.cover_book}
                        alt="Preview Cover"
                        className="h-24 w-16 shrink-0 rounded-xl border border-[#89CFF3] object-cover shadow-xs bg-white"
                      />
                    )}

                    <div className="flex-1 space-y-2.5">
                      {/* File Upload Input */}
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

                      {/* Or Direct URL */}
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
                    : 'Tambahkan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
