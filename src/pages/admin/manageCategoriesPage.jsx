import React, { useState } from 'react';
import { Tags, Plus, Edit3, Trash2, X } from 'lucide-react';
import { useLibrary } from '../../context/libraryContext';
import { useToast } from '../../context/toastContext';

export default function ManageCategoriesPage() {
  const { categories, books, addCategory, updateCategory, deleteCategory } = useLibrary();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      const res = await updateCategory(editingCat.id, { name, description });
      if (res.success) showToast(res.message, 'success');
      else showToast(res.message, 'error');
    } else {
      const res = await addCategory({ name, description });
      if (res.success) showToast(res.message, 'success');
      else showToast(res.message, 'error');
    }
    setModalOpen(false);
  };

  const handleDelete = async (cat) => {
    const res = await deleteCategory(cat.id);
    if (res.success) {
      showToast(res.message, 'info');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Kategori Buku</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Atur pengelompokan kategori untuk mempermudah pencarian buku di katalog Unipus.
          </p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = books.filter((b) => Number(b.category_id) === cat.id).length;
          return (
            <div
              key={cat.id}
              className="card-surface flex flex-col justify-between p-5 hover:border-[#89CFF3]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CDF5FD] text-[#00A9FF]">
                    <Tags className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#CDF5FD]/80 px-3 py-1 text-xs font-bold text-[#0088CC]">
                    {count} Judul Buku
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">{cat.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {cat.description || 'Tidak ada deskripsi'}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="btn-outline px-3 py-1.5 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#89CFF3] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
