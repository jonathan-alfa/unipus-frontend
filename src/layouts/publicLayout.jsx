import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Bell,
  LogOut,
  Menu,
  X,
  MapPin,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useLibrary } from '../context/libraryContext';
import BookCartDrawer from '../components/loans/bookCartDrawer';

export default function PublicLayout() {
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { notifications } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.user_id === currentUser?.id && !n.is_read
  ).length;

  // Scroll to hash section when navigating to /#section
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }
  }, [location.pathname, location.hash]);

  const handleSectionNav = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#A0E9FF]/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo (UNIPMA / Unipus) */}
          <Link
            to="/"
            onClick={() => handleSectionNav('home')}
            className="flex items-center gap-2.5"
          >
            <img
              src="/logo-unipma.png"
              alt="Logo UNIPUS"
              className="h-10 w-10 object-contain drop-shadow-xs"
            />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Uni<span className="text-[#00A9FF]">pus</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — Landing Page Sections + Katalog */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleSectionNav('home')}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#00A9FF]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('tentang')}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#00A9FF]"
            >
              Tentang Unipus
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('visi-misi')}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#00A9FF]"
            >
              Visi & Misi
            </button>
            <button
              type="button"
              onClick={() => handleSectionNav('katalog')}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#00A9FF]"
            >
              Katalog Buku
            </button>

            {isAuthenticated && (
              <NavLink
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive ? 'text-[#00A9FF]' : 'text-slate-600 hover:text-[#00A9FF]'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                {isAdmin ? 'Dashboard Admin' : 'Dashboard Saya'}
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {/* Book Cart Button (Only shown when logged in as User) */}
            {isAuthenticated && !isAdmin && (
              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex items-center gap-2 rounded-xl border border-[#89CFF3] bg-[#CDF5FD]/60 px-3.5 py-2 text-xs font-bold text-[#0088CC] transition-all hover:bg-[#A0E9FF]"
                title="Buka Book Cart Peminjaman"
              >
                <ShoppingBag className="h-4 w-4 text-[#00A9FF]" />
                <span className="hidden sm:inline">Book Cart</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#00A9FF] px-1.5 text-[11px] font-extrabold text-white">
                  {cartCount}
                </span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {!isAdmin && (
                  <Link
                    to="/notifications"
                    className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-[#89CFF3] hover:text-[#00A9FF]"
                    title="Notifikasi"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <Link
                  to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-[#89CFF3]"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00A9FF] text-[11px] font-bold text-white">
                    {currentUser?.name?.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate">{currentUser?.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-outline py-2 text-xs">
                  <LogIn className="h-3.5 w-3.5" />
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary py-2 text-xs">
                  <UserPlus className="h-3.5 w-3.5" />
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 space-y-3 md:hidden">
            <div className="flex flex-col space-y-1.5">
              <button
                type="button"
                onClick={() => handleSectionNav('home')}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[#CDF5FD]/50"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav('tentang')}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[#CDF5FD]/50"
              >
                Tentang Unipus
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav('visi-misi')}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[#CDF5FD]/50"
              >
                Visi & Misi
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav('katalog')}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[#CDF5FD]/50"
              >
                Katalog Buku
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/books"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#0088CC] hover:bg-[#CDF5FD]/50"
                  >
                    Semua Koleksi Buku →
                  </Link>
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#00A9FF] hover:bg-[#CDF5FD]/50"
                  >
                    {isAdmin ? 'Dashboard Admin' : 'Dashboard Saya'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Keluar (Logout)
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-outline flex-1"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary flex-1"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer — Website Asli & Alamat Perpustakaan UNIPMA */}
      <footer className="border-t border-[#89CFF3] bg-gradient-to-b from-white via-[#CDF5FD]/30 to-[#CDF5FD]/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Brand & Identity */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-unipma.png"
                  alt="Logo UNIPMA"
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <p className="text-lg font-extrabold text-slate-900">
                    UNI<span className="text-[#00A9FF]">PUS</span> — UNIPMA Perpustakaan
                  </p>
                  <p className="text-xs font-semibold text-[#0088CC]">
                    UPT Perpustakaan Universitas PGRI Madiun
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-600 max-w-md">
                Platform sistem manajemen perpustakaan berbasis web yang mempermudah sivitas akademika Universitas PGRI Madiun dalam mengakses katalog, meminjam, dan mengembalikan buku secara online.
              </p>
            </div>

            {/* Navigasi Section */}
            <div className="md:col-span-3 space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Navigasi Halaman
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionNav('home')}
                    className="hover:text-[#00A9FF]"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionNav('tentang')}
                    className="hover:text-[#00A9FF]"
                  >
                    Tentang Website Unipus
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleSectionNav('visi-misi')}
                    className="hover:text-[#00A9FF]"
                  >
                    Visi & Misi Perpustakaan
                  </button>
                </li>
                <li>
                  <Link to="/books" className="hover:text-[#00A9FF]">
                    Katalog Buku Lengkap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Website Resmi & Alamat Jalan Perpustakaan UNIPMA */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Informasi & Lokasi Perpustakaan UNIPMA
              </h4>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00A9FF]" />
                  <div>
                    <p className="font-bold text-slate-900">Alamat Perpustakaan UNIPMA:</p>
                    <p className="leading-relaxed text-slate-600">
                      Jl. Setiabudi No. 85, Kanigoro, Kec. Kartoharjo, Kota Madiun, Jawa Timur 63118
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#00A9FF]" />
                  <div>
                    <p className="font-bold text-slate-900">Website Resmi:</p>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 font-bold text-[#00A9FF] hover:underline"
                    >
                      Website Resmi Perpustakaan UNIPMA
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#89CFF3]/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} UNIPUS — UNIPMA Perpustakaan (Universitas PGRI Madiun).</p>
            <a href="#" className="font-semibold text-[#0088CC] hover:underline">
              Kunjungi Portal Utama Perpustakaan UNIPMA →
            </a>
          </div>
        </div>
      </footer>

      <BookCartDrawer />
    </div>
  );
}
