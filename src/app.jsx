import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/toastContext';
import { AuthProvider } from './context/authContext';
import { LibraryProvider } from './context/libraryContext';
import { CartProvider } from './context/cartContext';
import AppRoutes from './routes/appRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LibraryProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </LibraryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
