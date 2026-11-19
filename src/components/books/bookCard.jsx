import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Check, BookOpen, Calendar, User } from 'lucide-react';
import StockBadge from '../common/stockBadge';
import { useCart } from '../../context/cartContext';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../context/toastContext';

export default function BookCard({ book }) {
  const { addToCart, isInCart, openCart } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const inCart = isInCart(book.id);
  const isAvailable = Number(book.available_stock) > 0;

  const handleOpenDetail = () => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk melihat detail dan katalog buku.', 'info');
      navigate('/login', { state: { from: { pathname: `/books/${book.id}` } } });
      return;
    }
    navigate(`/books/${book.id}`);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk meminjam buku.', 'info');
      navigate('/login', { state: { from: { pathname: '/books' } } });
      return;
    }
    addToCart(book);
  };

  return (
    <div className="card-surface group flex flex-col overflow-hidden hover:-translate-y-1 hover:border-[#89CFF3] hover:shadow-glow">
      <div
        onClick={handleOpenDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleOpenDetail()}
        className="relative block aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#CDF5FD]/40"
      >
        <img
          src={book.cover_image}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-2 top-2 right-2 sm:left-3 sm:top-3 sm:right-3">
          <span className="inline-block max-w-full truncate rounded-lg bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-[#0088CC] shadow-sm backdrop-blur-sm">
            {book.category_name}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between">
          <StockBadge availableStock={book.available_stock} totalStock={book.total_stock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 truncate">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-[#00A9FF]" />
            <span className="truncate">{book.author}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-[#89CFF3]" />
            {book.publication_year}
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpenDetail}
          className="mb-1 sm:mb-2 line-clamp-2 text-left text-xs sm:text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#00A9FF]"
          title={book.title}
        >
          {book.title}
        </button>

        <p className="mb-2.5 sm:mb-4 hidden sm:line-clamp-2 text-xs leading-relaxed text-slate-500">
          {book.synopsis}
        </p>

        <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleOpenDetail}
            className="btn-outline flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs"
          >
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Detail
          </button>

          {!isAdmin && (
            inCart && isAuthenticated ? (
              <button
                type="button"
                onClick={openCart}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#CDF5FD] px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-bold text-[#0088CC] border border-[#89CFF3] transition-all hover:bg-[#A0E9FF]"
              >
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">Di Cart</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className="btn-primary flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs"
              >
                <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">+ Cart</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
