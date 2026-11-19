import React from 'react';
import { Bell, CheckCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useLibrary } from '../../context/libraryContext';
import { formatDateTime } from '../../utils/formatDate';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useLibrary();

  const userNotifications = notifications.filter(
    (n) => n.user_id === currentUser?.id
  );
  const unreadCount = userNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifikasi Akun</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Informasi pembaruan status pengajuan peminjaman dan pengembalian buku Anda.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="btn-secondary self-start sm:self-auto text-xs"
          >
            <CheckCheck className="h-4 w-4 text-[#00A9FF]" />
            Tandai Semua Sudah Dibaca ({unreadCount})
          </button>
        )}
      </div>

      {userNotifications.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#CDF5FD] text-[#00A9FF]">
            <Bell className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-slate-800">Belum Ada Notifikasi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`card-surface flex items-start justify-between gap-4 p-5 transition-all ${
                !notif.is_read
                  ? 'border-l-4 border-l-[#00A9FF] bg-[#CDF5FD]/25'
                  : 'opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    !notif.is_read
                      ? 'bg-[#00A9FF] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {notif.message}
                  </p>
                  <span className="mt-2 block text-[11px] text-slate-400">
                    {formatDateTime(notif.created_at)}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  type="button"
                  onClick={() => markNotificationRead(notif.id)}
                  className="btn-outline shrink-0 px-3 py-1.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  Tandai Dibaca
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
