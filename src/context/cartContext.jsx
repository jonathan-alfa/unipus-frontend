import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLibrary } from './libraryContext';
import { useToast } from './toastContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'unipus_book_cart_v2';

export function CartProvider({ children }) {
  const { books, settings } = useLibrary();
  const { showToast } = useToast();

  const [cartBookIds, setCartBookIds] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartBookIds));
  }, [cartBookIds]);

  const cartItems = useMemo(() => {
    return cartBookIds
      .map((id) => books.find((b) => b.id === Number(id)))
      .filter(Boolean);
  }, [cartBookIds, books]);

  const isInCart = (bookId) => cartBookIds.includes(Number(bookId));

  const addToCart = (book) => {
    const bookId = Number(book.id);

    if (book.available_stock <= 0) {
      showToast('Buku ini sedang habis stoknya dan tidak dapat ditambahkan.', 'error');
      return false;
    }

    if (cartBookIds.includes(bookId)) {
      showToast(`"${book.title}" sudah ada di dalam Book Cart Anda.`, 'info');
      setIsCartOpen(true);
      return false;
    }

    if (cartBookIds.length >= settings.maxBooksPerLoan) {
      showToast(
        `Maksimal ${settings.maxBooksPerLoan} buku dalam satu pengajuan peminjaman.`,
        'error'
      );
      setIsCartOpen(true);
      return false;
    }

    setCartBookIds((prev) => [...prev, bookId]);
    showToast(`"${book.title}" ditambahkan ke Book Cart!`, 'success');
    return true;
  };

  const removeFromCart = (bookId) => {
    setCartBookIds((prev) => prev.filter((id) => id !== Number(bookId)));
  };

  const clearCart = () => {
    setCartBookIds([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartBookIds,
        cartItems,
        cartCount: cartItems.length,
        isCartOpen,
        isInCart,
        addToCart,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
