import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import {
  INITIAL_BOOKS,
  INITIAL_CATEGORIES,
  INITIAL_LOANS,
  INITIAL_LOAN_ITEMS,
  INITIAL_LOAN_STATUS_HISTORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../mocks/mockData';
import {
  INITIAL_LIBRARY_SETTINGS_ROWS,
  INITIAL_LOAN_STATUSES,
  LOAN_STATUS,
  NIM_STATUS,
} from '../utils/constants';
import { addDaysToDate } from '../utils/formatDate';
import { useAuth } from './authContext';

const LibraryContext = createContext(null);

const STORAGE_KEYS = {
  BOOKS: 'unipus_books_v4',
  CATEGORIES: 'unipus_categories_v4',
  LOANS: 'unipus_loans_v4',
  LOAN_ITEMS: 'unipus_loan_items_v4',
  LOAN_HISTORIES: 'unipus_loan_histories_v4',
  NOTIFICATIONS: 'unipus_notifications_v4',
  ACTIVITY_LOGS: 'unipus_activity_logs_v4',
  SETTINGS_ROWS: 'unipus_settings_rows_v4',
};

export function LibraryProvider({ children }) {
  const { users, currentUser, isAdmin } = useAuth();

  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [loanItems, setLoanItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOAN_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_LOAN_ITEMS;
  });

  const [loanStatusHistories, setLoanStatusHistories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOAN_HISTORIES);
    return saved ? JSON.parse(saved) : INITIAL_LOAN_STATUS_HISTORIES;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [settingsRows, setSettingsRows] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS_ROWS);
    return saved ? JSON.parse(saved) : INITIAL_LIBRARY_SETTINGS_ROWS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOAN_ITEMS, JSON.stringify(loanItems));
  }, [loanItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOAN_HISTORIES, JSON.stringify(loanStatusHistories));
  }, [loanStatusHistories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS_ROWS, JSON.stringify(settingsRows));
  }, [settingsRows]);

  // Synchronize data from Backend REST API (`/api/books`, `/api/categories`, `/api/loans`, etc.)
  const syncFromBackend = useCallback(async () => {
    try {
      const [booksRes, catsRes] = await Promise.all([
        axiosClient.get('/books', { params: { limit: 100, include_inactive: true } }),
        axiosClient.get('/categories'),
      ]);
      if (booksRes.data?.books) setBooks(booksRes.data.books);
      if (catsRes.data?.categories) setCategories(catsRes.data.categories);
    } catch {
      // Backend offline -> continue with cached/mock state
    }

    if (!currentUser) return;

    try {
      const notifRes = await axiosClient.get('/users/notifications');
      if (notifRes.data?.notifications) {
        setNotifications(notifRes.data.notifications);
      }
    } catch {
      // Ignore if offline
    }

    try {
      if (isAdmin) {
        const [adminLoansRes, settingsRes] = await Promise.all([
          axiosClient.get('/admin/loans'),
          axiosClient.get('/admin/settings'),
        ]);
        if (adminLoansRes.data?.loans) setLoans(adminLoansRes.data.loans);
        if (settingsRes.data?.settings) setSettingsRows(settingsRes.data.settings);
      } else {
        const myLoansRes = await axiosClient.get('/loans/my');
        if (myLoansRes.data?.loans) setLoans(myLoansRes.data.loans);
      }
    } catch {
      // Ignore if offline
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  // Derived settings object from key-value table `library_settings`
  const settings = useMemo(() => {
    const getVal = (key, fallback) => {
      const found = settingsRows.find((r) => r.key === key);
      return found ? Number(found.value) || fallback : fallback;
    };
    const maxLoans = getVal('max_active_loans', 3);
    return {
      defaultLoanDurationDays: getVal('loan_duration_days', 7),
      maxBooksPerLoan: getVal('max_books_per_loan', maxLoans),
      maxActiveLoansPerUser: maxLoans,
    };
  }, [settingsRows]);

  const addNotification = (userId, title, message, loanId = null) => {
    const now = new Date().toISOString();
    setNotifications((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        user_id: userId,
        loan_id: loanId,
        title,
        message,
        read_at: null,
        created_at: now,
      },
      ...prev,
    ]);
  };

  const addActivityLog = (userId, action, entityType, entityId, description, extraMeta = {}) => {
    const now = new Date().toISOString();
    setActivityLogs((prev) => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: { description, ...extraMeta },
        created_at: now,
      },
      ...prev,
    ]);
  };

  const addLoanStatusHistory = (loanId, fromStatus, toStatus, changedBy, note) => {
    const now = new Date().toISOString();
    setLoanStatusHistories((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        loan_id: Number(loanId),
        from_status: fromStatus,
        to_status: toStatus,
        changed_by: changedBy,
        note,
        created_at: now,
      },
    ]);
  };

  const DEFAULT_BOOK_COVER =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const enrichedBooks = useMemo(() => {
    return books.map((book) => {
      const cat = categories.find((c) => c.id === Number(book.category_id));
      const cover = book.cover_book || book.cover_image || DEFAULT_BOOK_COVER;

      // Normalize physical copies (`book_copies`)
      let copies = Array.isArray(book.copies) ? book.copies : [];
      if (copies.length === 0 && Number(book.total_stock) > 0) {
        const total = Number(book.total_stock) || 0;
        const avail = Number(book.available_stock) || 0;
        copies = Array.from({ length: total }, (_, idx) => ({
          id: book.id * 100 + idx + 1,
          book_id: book.id,
          copy_code: idx < avail ? `UNIPUS-${book.id}-${String(idx + 1).padStart(3, '0')}` : null,
          status: idx < avail ? 'available' : 'pending_code',
        }));
      }

      const codedCount =
        book.coded_count !== undefined
          ? Number(book.coded_count)
          : copies.filter((c) => c.status !== 'pending_code' && Boolean(c.copy_code)).length;
      const pendingCount =
        book.pending_count !== undefined
          ? Number(book.pending_count)
          : copies.filter((c) => c.status === 'pending_code' || !c.copy_code).length;

      return {
        ...book,
        cover_book: cover,
        cover_image: cover,
        category_name: book.category_name || (cat ? cat.name : 'Tanpa Kategori'),
        copies,
        coded_count: codedCount,
        pending_count: pendingCount,
        is_published_to_catalog: book.is_active !== false && codedCount > 0,
      };
    });
  }, [books, categories]);

  const enrichedNotifications = useMemo(() => {
    return notifications.map((n) => ({
      ...n,
      is_read: Boolean(n.read_at),
    }));
  }, [notifications]);

  const enrichedActivityLogs = useMemo(() => {
    return activityLogs.map((log) => ({
      ...log,
      activity: log.action,
      description:
        log.metadata?.description || `${log.action} pada ${log.entity_type} #${log.entity_id}`,
    }));
  }, [activityLogs]);

  // Enriched loans supporting BOTH Backend response (`loan.books`) and local `loanItems`
  const enrichedLoans = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return loans
      .map((loan) => {
        const borrower = users.find((u) => u.id === Number(loan.user_id));
        const approver = loan.approved_by
          ? users.find((u) => u.id === Number(loan.approved_by))
          : null;
        const receiver = loan.received_by
          ? users.find((u) => u.id === Number(loan.received_by))
          : null;

        let items = [];
        if (Array.isArray(loan.books) && loan.books.length > 0) {
          items = loan.books.map((b, idx) => {
            const fullBook = enrichedBooks.find((eb) => eb.id === Number(b.id)) || b;
            const cover =
              b.cover_book || b.cover_image || fullBook.cover_book || fullBook.cover_image || DEFAULT_BOOK_COVER;
            return {
              id: `${loan.id}-${b.id || idx}`,
              loan_id: loan.id,
              book_id: b.id,
              copy_code: b.copy_code || null,
              quantity: 1,
              book: {
                ...fullBook,
                ...b,
                cover_book: cover,
                cover_image: cover,
              },
            };
          });
        } else {
          items = loanItems
            .filter((item) => item.loan_id === loan.id)
            .map((item) => {
              const book = enrichedBooks.find((b) => b.id === Number(item.book_id));
              return {
                ...item,
                quantity: 1,
                book: book || {
                  id: item.book_id,
                  title: 'Buku Tidak Ditemukan',
                  author: '-',
                  cover_book: DEFAULT_BOOK_COVER,
                  cover_image: DEFAULT_BOOK_COVER,
                },
              };
            });
        }

        const histories = (loan.histories || loanStatusHistories.filter((h) => Number(h.loan_id) === Number(loan.id)))
          .map((h) => {
            const actor = users.find((u) => u.id === Number(h.changed_by));
            return {
              ...h,
              changed_by_name: h.changed_by_name || (actor ? actor.name : 'Sistem'),
            };
          })
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        let computedStatus = (loan.status || '').toLowerCase();
        if (computedStatus === 'return_request') {
          computedStatus = LOAN_STATUS.RETURN_REQUESTED;
        }
        if (
          computedStatus === LOAN_STATUS.BORROWED &&
          loan.due_date &&
          new Date(loan.due_date) < now
        ) {
          computedStatus = LOAN_STATUS.OVERDUE;
        }

        return {
          ...loan,
          transaction_code: `LOAN-#${loan.id}`,
          return_date: loan.returned_at,
          status: computedStatus,
          user_name: loan.user_name || (borrower ? borrower.name : 'Pengguna'),
          user_email: loan.user_email || (borrower ? borrower.email : '-'),
          user_nim: loan.user_nim || (borrower ? borrower.nim : '-'),
          user_member_id: loan.user_nim || borrower?.nim || '-',
          user_nim_status: borrower?.nim_status || NIM_STATUS.NONE,
          approver_name: approver ? approver.name : loan.approved_by ? `Admin #${loan.approved_by}` : '-',
          receiver_name: receiver ? receiver.name : loan.received_by ? `Admin #${loan.received_by}` : '-',
          items,
          histories,
          total_books: items.length,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [loans, loanItems, loanStatusHistories, users, enrichedBooks]);

  // 1. Submit Loan Request (`POST /api/loans` with `{ book_ids, notes }`)
  const createLoanRequest = async ({ bookIds, notes = '' }) => {
    if (!currentUser) {
      return { success: false, message: 'Silakan login terlebih dahulu untuk meminjam buku.' };
    }

    try {
      const res = await axiosClient.post('/loans', {
        book_ids: bookIds.map(Number),
        notes: notes.trim() || null,
      });
      await syncFromBackend();
      return {
        success: true,
        loan: res.data?.loan,
        message: `Pengajuan peminjaman berhasil dikirim! Menunggu persetujuan Admin.`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal mengajukan peminjaman buku.',
        };
      }

      // Offline fallback
      const freshUser = users.find((u) => u.id === currentUser.id) || currentUser;
      if (freshUser.nim_status !== NIM_STATUS.APPROVED) {
        return {
          success: false,
          message: `NIM Anda belum terverifikasi (Status: ${freshUser.nim_status.toUpperCase()}). Pengajuan peminjaman hanya dapat dilakukan setelah NIM disetujui oleh Admin/Petugas.`,
        };
      }

      if (!bookIds || bookIds.length === 0) {
        return { success: false, message: 'Pilih minimal 1 buku untuk diajukan.' };
      }

      if (bookIds.length > settings.maxBooksPerLoan) {
        return {
          success: false,
          message: `Maksimal ${settings.maxBooksPerLoan} buku per transaksi peminjaman.`,
        };
      }

      for (const bookId of bookIds) {
        const targetBook = books.find((b) => b.id === Number(bookId));
        if (!targetBook || !targetBook.is_active || targetBook.available_stock <= 0) {
          return {
            success: false,
            message: `Stok buku "${targetBook?.title || bookId}" sedang tidak tersedia.`,
          };
        }
      }

      const now = new Date().toISOString();
      const newLoanId = loans.length > 0 ? Math.max(...loans.map((l) => l.id)) + 1 : 5001;

      const newLoan = {
        id: newLoanId,
        user_id: currentUser.id,
        status: LOAN_STATUS.PENDING,
        approved_by: null,
        approved_at: null,
        loan_date: null,
        due_date: null,
        returned_at: null,
        received_by: null,
        notes: notes.trim() || 'Peminjaman reguler perpustakaan',
        created_at: now,
        updated_at: now,
      };

      const maxItemId = loanItems.length > 0 ? Math.max(...loanItems.map((i) => i.id)) : 0;
      const newItems = bookIds.map((bookId, idx) => ({
        id: maxItemId + idx + 1,
        loan_id: newLoanId,
        book_id: Number(bookId),
        created_at: now,
      }));

      setLoans((prev) => [newLoan, ...prev]);
      setLoanItems((prev) => [...prev, ...newItems]);

      addLoanStatusHistory(
        newLoanId,
        null,
        LOAN_STATUS.PENDING,
        currentUser.id,
        notes.trim() || 'Pengajuan peminjaman buku dibuat oleh pengguna'
      );
      addNotification(
        currentUser.id,
        `Pengajuan Terkirim (#${newLoanId})`,
        `Permintaan peminjaman ${bookIds.length} buku berhasil dikirim dan menunggu persetujuan Admin.`,
        newLoanId
      );
      addActivityLog(
        currentUser.id,
        'CREATE_LOAN',
        'loans',
        newLoanId,
        `${currentUser.name} mengajukan peminjaman ${bookIds.length} buku (#${newLoanId})`,
        { book_ids: bookIds }
      );

      return {
        success: true,
        loan: newLoan,
        message: `Pengajuan peminjaman #${newLoanId} berhasil dikirim! Menunggu persetujuan Admin.`,
      };
    }
  };

  // 2. Cancel Loan Request (`PATCH /api/loans/:id/cancel`)
  const cancelLoanRequest = async (loanId) => {
    try {
      await axiosClient.patch(`/loans/${loanId}/cancel`);
      await syncFromBackend();
      return {
        success: true,
        message: `Pengajuan #${loanId} berhasil dibatalkan.`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal membatalkan pengajuan.',
        };
      }

      const targetLoan = loans.find((l) => l.id === Number(loanId));
      if (!targetLoan || targetLoan.status.toLowerCase() !== LOAN_STATUS.PENDING) {
        return {
          success: false,
          message: 'Hanya pengajuan yang masih berstatus Pending yang dapat dibatalkan.',
        };
      }

      const now = new Date().toISOString();
      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? { ...l, status: LOAN_STATUS.CANCELLED, updated_at: now }
            : l
        )
      );
      addLoanStatusHistory(
        loanId,
        LOAN_STATUS.PENDING,
        LOAN_STATUS.CANCELLED,
        currentUser?.id || targetLoan.user_id,
        'Cancelled by user'
      );
      return {
        success: true,
        message: `Pengajuan #${loanId} berhasil dibatalkan.`,
      };
    }
  };

  // Fetch single loan detail including `histories` (`GET /api/loans/:id`)
  const fetchLoanDetail = useCallback(async (loanId) => {
    try {
      const res = await axiosClient.get(`/loans/${loanId}`);
      if (res.data?.loan) {
        const detailed = res.data.loan;
        setLoans((prev) =>
          prev.map((l) => (l.id === Number(loanId) ? { ...l, ...detailed } : l))
        );
        return detailed;
      }
    } catch {
      // Return null if offline; modal will use existing enriched loan
    }
    return null;
  }, []);

  // 3. Approve Loan Request (`PATCH /api/admin/loans/:id/approve`)
  const approveLoanRequest = async (loanId, options = {}) => {
    const durationDays =
      typeof options === 'number'
        ? options
        : Number(options.durationDays || settings.defaultLoanDurationDays || 7);

    const payload = {
      duration_days: durationDays,
    };
    if (options && typeof options === 'object') {
      if (options.dueDate) payload.due_date = options.dueDate;
      if (options.requirePickup !== undefined) payload.require_pickup = Boolean(options.requirePickup);
      if (options.note) payload.note = options.note.trim();
    }

    try {
      await axiosClient.patch(`/admin/loans/${loanId}/approve`, payload);
      await syncFromBackend();
      return {
        success: true,
        message: `Peminjaman #${loanId} disetujui & stok otomatis diperbarui.`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menyetujui peminjaman.',
        };
      }

      const targetLoan = enrichedLoans.find((l) => l.id === Number(loanId));
      if (!targetLoan || targetLoan.status !== LOAN_STATUS.PENDING) {
        return { success: false, message: 'Pengajuan ini sudah diproses sebelumnya.' };
      }

      for (const item of targetLoan.items) {
        const currentBook = books.find((b) => b.id === Number(item.book_id));
        if (!currentBook || currentBook.available_stock < 1) {
          return {
            success: false,
            message: `Stok buku "${currentBook?.title || item.book_id}" tidak mencukupi.`,
          };
        }
      }

      const now = new Date().toISOString();
      const todayDate = now.slice(0, 10);
      const duration = Number(customDurationDays || settings.defaultLoanDurationDays || 7);
      const dueDate = addDaysToDate(now, duration).slice(0, 10);

      setBooks((prev) =>
        prev.map((book) => {
          const isBorrowed = targetLoan.items.some((i) => Number(i.book_id) === book.id);
          if (!isBorrowed) return book;
          return {
            ...book,
            available_stock: Math.max(0, book.available_stock - 1),
            updated_at: now,
          };
        })
      );

      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? {
                ...l,
                status: LOAN_STATUS.BORROWED,
                loan_date: todayDate,
                due_date: dueDate,
                approved_by: currentUser?.id || 1,
                approved_at: now,
                updated_at: now,
              }
            : l
        )
      );

      addLoanStatusHistory(
        loanId,
        LOAN_STATUS.PENDING,
        LOAN_STATUS.BORROWED,
        currentUser?.id || 1,
        'Approved by Admin'
      );
      return {
        success: true,
        message: `Peminjaman #${targetLoan.id} disetujui & stok otomatis diperbarui.`,
      };
    }
  };

  // 3b. Handover Loan (`PATCH /api/admin/loans/:id/handover`)
  const handoverLoan = async (loanId) => {
    try {
      await axiosClient.patch(`/admin/loans/${loanId}/handover`);
      await syncFromBackend();
      return {
        success: true,
        message: `Buku transaksi #${loanId} telah diserahkan ke peminjam (Borrowed).`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui status handover.',
        };
      }

      const now = new Date().toISOString();
      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? { ...l, status: LOAN_STATUS.BORROWED, loan_date: now.slice(0, 10), updated_at: now }
            : l
        )
      );
      addLoanStatusHistory(
        loanId,
        LOAN_STATUS.APPROVED,
        LOAN_STATUS.BORROWED,
        currentUser?.id || 1,
        'Books handed over to borrower'
      );
      return {
        success: true,
        message: `Buku transaksi #${loanId} telah diserahkan ke peminjam (Borrowed).`,
      };
    }
  };

  // 4. Reject Loan Request (`PATCH /api/admin/loans/:id/reject` with `{ note }`)
  const rejectLoanRequest = async (loanId, reason = '') => {
    try {
      await axiosClient.patch(`/admin/loans/${loanId}/reject`, {
        note: reason.trim() || 'Rejected by Admin',
      });
      await syncFromBackend();
      return {
        success: true,
        message: `Pengajuan #${loanId} telah ditolak.`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menolak pengajuan.',
        };
      }

      const now = new Date().toISOString();
      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? {
                ...l,
                status: LOAN_STATUS.REJECTED,
                notes: reason || 'Rejected by Admin',
                updated_at: now,
              }
            : l
        )
      );
      addLoanStatusHistory(
        loanId,
        LOAN_STATUS.PENDING,
        LOAN_STATUS.REJECTED,
        currentUser?.id || 1,
        reason || 'Rejected by Admin'
      );
      return {
        success: true,
        message: `Pengajuan #${loanId} telah ditolak.`,
      };
    }
  };

  // 5. Request Return (`PATCH /api/loans/:id/return-request`)
  const requestBookReturn = async (loanId) => {
    try {
      await axiosClient.patch(`/loans/${loanId}/return-request`);
      await syncFromBackend();
      return {
        success: true,
        message: `Pengajuan pengembalian #${loanId} berhasil dikirim ke Admin.`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal mengajukan pengembalian.',
        };
      }

      const targetLoan = enrichedLoans.find((l) => l.id === Number(loanId));
      if (!targetLoan) {
        return { success: false, message: 'Transaksi tidak ditemukan.' };
      }

      const now = new Date().toISOString();
      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? { ...l, status: LOAN_STATUS.RETURN_REQUESTED, updated_at: now }
            : l
        )
      );
      addLoanStatusHistory(
        loanId,
        targetLoan.status,
        LOAN_STATUS.RETURN_REQUESTED,
        currentUser?.id || targetLoan.user_id,
        'Return requested by user'
      );
      return {
        success: true,
        message: `Pengajuan pengembalian #${targetLoan.id} berhasil dikirim ke Admin.`,
      };
    }
  };

  // 6. Confirm Return (`PATCH /api/admin/loans/:id/confirm-return`)
  const confirmBookReturn = async (loanId) => {
    try {
      await axiosClient.patch(`/admin/loans/${loanId}/confirm-return`);
      await syncFromBackend();
      return {
        success: true,
        message: `Pengembalian #${loanId} berhasil dikonfirmasi & stok telah dikembalikan!`,
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal mengonfirmasi pengembalian.',
        };
      }

      const targetLoan = enrichedLoans.find((l) => l.id === Number(loanId));
      if (!targetLoan) {
        return { success: false, message: 'Data transaksi tidak ditemukan.' };
      }

      const now = new Date().toISOString();
      const receiverId = currentUser?.id || 1;

      setBooks((prev) =>
        prev.map((book) => {
          const isReturned = targetLoan.items.some((i) => Number(i.book_id) === book.id);
          if (!isReturned) return book;
          return {
            ...book,
            available_stock: Math.min(book.total_stock, book.available_stock + 1),
            updated_at: now,
          };
        })
      );

      setLoans((prev) =>
        prev.map((l) =>
          l.id === Number(loanId)
            ? {
                ...l,
                status: LOAN_STATUS.RETURNED,
                returned_at: now,
                received_by: receiverId,
                updated_at: now,
              }
            : l
        )
      );

      addLoanStatusHistory(
        loanId,
        targetLoan.status,
        LOAN_STATUS.RETURNED,
        receiverId,
        'Book return confirmed by Admin'
      );
      return {
        success: true,
        message: `Pengembalian #${targetLoan.id} berhasil dikonfirmasi & stok telah dikembalikan!`,
      };
    }
  };

  // 7. Update Due Date
  const updateLoanDueDate = (loanId, newDueDate) => {
    const now = new Date().toISOString();
    const formattedDue = newDueDate.slice(0, 10);
    setLoans((prev) =>
      prev.map((l) =>
        l.id === Number(loanId)
          ? {
              ...l,
              due_date: formattedDue,
              status:
                new Date(formattedDue) >= new Date() && l.status === LOAN_STATUS.OVERDUE
                  ? LOAN_STATUS.BORROWED
                  : l.status,
              updated_at: now,
            }
          : l
      )
    );
    return { success: true, message: 'Batas waktu pengembalian berhasil diperbarui.' };
  };

  // 8. Book Management CRUD (`POST /api/admin/books`, `PUT /api/admin/books/:id`, `DELETE /api/admin/books/:id`)
  const cleanIsbn = (rawIsbn) => {
    const trimmed = (rawIsbn || '').trim();
    if (!trimmed || trimmed === '-') return null;
    return trimmed;
  };

  const buildBookFormData = (bookData, isUpdate = false) => {
    const fd = new FormData();
    fd.append('title', bookData.title.trim());
    fd.append('total_stock', String(Number(bookData.total_stock)));
    if (bookData.category_id) fd.append('category_id', String(Number(bookData.category_id)));
    if (bookData.author?.trim()) fd.append('author', bookData.author.trim());
    if (bookData.publisher?.trim()) fd.append('publisher', bookData.publisher.trim());
    if (bookData.publication_year) fd.append('publication_year', String(Number(bookData.publication_year)));
    const validIsbn = cleanIsbn(bookData.isbn);
    if (validIsbn) fd.append('isbn', validIsbn);
    if (bookData.synopsis?.trim()) fd.append('synopsis', bookData.synopsis.trim());
    if (isUpdate && bookData.is_active !== undefined) {
      fd.append('is_active', String(Boolean(bookData.is_active)));
    }
    if (Array.isArray(bookData.copy_codes) && bookData.copy_codes.length > 0) {
      fd.append('copy_codes', JSON.stringify(bookData.copy_codes));
    }
    if (bookData.coverFile) {
      fd.append('cover_book', bookData.coverFile);
    }
    return fd;
  };

  const addBook = async (bookData) => {
    const cleanCodes = Array.isArray(bookData.copy_codes)
      ? bookData.copy_codes.map((c) => c.trim()).filter(Boolean)
      : [];
    const payload = {
      category_id: Number(bookData.category_id) || null,
      title: bookData.title.trim(),
      author: bookData.author?.trim() || null,
      publisher: bookData.publisher?.trim() || null,
      publication_year: Number(bookData.publication_year) || null,
      isbn: cleanIsbn(bookData.isbn),
      synopsis: bookData.synopsis?.trim() || null,
      cover_book:
        (bookData.cover_book || bookData.cover_image)?.trim() ||
        DEFAULT_BOOK_COVER,
      total_stock: Number(bookData.total_stock),
      copy_codes: cleanCodes,
    };

    try {
      let res;
      if (bookData.coverFile) {
        const formData = buildBookFormData({ ...bookData, copy_codes: cleanCodes }, false);
        res = await axiosClient.post('/admin/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axiosClient.post('/admin/books', payload);
      }
      await syncFromBackend();
      return {
        success: true,
        book: res.data?.book,
        message:
          cleanCodes.length > 0
            ? 'Buku dan kode eksemplar berhasil ditambahkan ke katalog.'
            : 'Data buku tersimpan! Silakan input kode buku satu per satu agar tampil di katalog web.',
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menambahkan buku.',
        };
      }

      const now = new Date().toISOString();
      const newId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 101;
      const copies = Array.from({ length: payload.total_stock }, (_, idx) => {
        const code = cleanCodes[idx] || null;
        return {
          id: Date.now() + idx,
          book_id: newId,
          copy_code: code,
          status: code ? 'available' : 'pending_code',
        };
      });
      const newBook = {
        id: newId,
        ...payload,
        cover_book: bookData.previewUrl || payload.cover_book,
        is_active: true,
        available_stock: cleanCodes.length,
        coded_count: cleanCodes.length,
        pending_count: payload.total_stock - cleanCodes.length,
        copies,
        created_at: now,
        updated_at: now,
      };
      setBooks((prev) => [newBook, ...prev]);
      return {
        success: true,
        book: newBook,
        message:
          cleanCodes.length > 0
            ? 'Buku dan kode eksemplar berhasil ditambahkan ke katalog.'
            : 'Data buku tersimpan! Silakan input kode buku satu per satu agar tampil di katalog web.',
      };
    }
  };

  const updateBook = async (bookId, bookData) => {
    const payload = {
      category_id: Number(bookData.category_id) || null,
      title: bookData.title.trim(),
      author: bookData.author?.trim() || null,
      publisher: bookData.publisher?.trim() || null,
      publication_year: Number(bookData.publication_year) || null,
      isbn: cleanIsbn(bookData.isbn),
      synopsis: bookData.synopsis?.trim() || null,
      cover_book: (bookData.cover_book || bookData.cover_image)?.trim() || null,
      total_stock: Number(bookData.total_stock),
      is_active: bookData.is_active !== undefined ? Boolean(bookData.is_active) : true,
    };

    try {
      if (bookData.coverFile) {
        const formData = buildBookFormData(bookData, true);
        await axiosClient.put(`/admin/books/${bookId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosClient.put(`/admin/books/${bookId}`, payload);
      }
      await syncFromBackend();
      return { success: true, message: 'Informasi buku berhasil diperbarui.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui buku.',
        };
      }

      const now = new Date().toISOString();
      setBooks((prev) =>
        prev.map((b) =>
          b.id === Number(bookId)
            ? {
                ...b,
                ...payload,
                cover_book: bookData.previewUrl || payload.cover_book || b.cover_book,
                available_stock: Number(bookData.available_stock ?? b.available_stock),
                updated_at: now,
              }
            : b
        )
      );
      return { success: true, message: 'Informasi buku berhasil diperbarui.' };
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const res = await axiosClient.delete(`/admin/books/${bookId}`);
      await syncFromBackend();
      return {
        success: true,
        message: res.data?.message || 'Buku berhasil dihapus dari katalog.',
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Tidak dapat menghapus buku ini.',
        };
      }

      const activeStatuses = [
        LOAN_STATUS.PENDING,
        LOAN_STATUS.APPROVED,
        LOAN_STATUS.BORROWED,
        LOAN_STATUS.RETURN_REQUESTED,
        LOAN_STATUS.OVERDUE,
      ];
      const hasActiveLoan = enrichedLoans.some(
        (loan) =>
          activeStatuses.includes(loan.status) &&
          loan.items.some((item) => Number(item.book_id) === Number(bookId))
      );

      if (hasActiveLoan) {
        return {
          success: false,
          message: 'Buku dengan transaksi aktif tidak boleh dihapus.',
        };
      }

      setBooks((prev) => prev.filter((b) => b.id !== Number(bookId)));
      return { success: true, message: 'Buku berhasil dihapus dari katalog.' };
    }
  };

  // 8b. Assign Copy Codes (`PATCH /api/admin/books/:id/assign-codes`)
  const assignBookCopyCodes = async (bookId, copyCodesInput) => {
    const cleanCodes = (Array.isArray(copyCodesInput) ? copyCodesInput : [copyCodesInput])
      .map((c) => String(c).trim())
      .filter(Boolean);

    if (cleanCodes.length === 0) {
      return { success: false, message: 'Masukkan minimal 1 kode buku.' };
    }

    try {
      const res = await axiosClient.patch(`/admin/books/${bookId}/assign-codes`, {
        copy_codes: cleanCodes,
      });
      await syncFromBackend();
      return {
        success: true,
        book: res.data?.book,
        message: res.data?.message || 'Kode buku berhasil disimpan & buku kini tampil di katalog!',
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menyimpan kode buku.',
        };
      }

      // Offline fallback
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== Number(bookId)) return b;
          const existingCopies = Array.isArray(b.copies) ? [...b.copies] : [];
          let codeIdx = 0;
          const updatedCopies = existingCopies.map((copy) => {
            if ((copy.status === 'pending_code' || !copy.copy_code) && codeIdx < cleanCodes.length) {
              const assigned = cleanCodes[codeIdx++];
              return { ...copy, copy_code: assigned, status: 'available' };
            }
            return copy;
          });
          const availCount = updatedCopies.filter((c) => c.status === 'available').length;
          const codedCount = updatedCopies.filter((c) => c.status !== 'pending_code' && Boolean(c.copy_code)).length;
          const pendingCount = updatedCopies.length - codedCount;
          return {
            ...b,
            copies: updatedCopies,
            available_stock: availCount,
            coded_count: codedCount,
            pending_count: pendingCount,
          };
        })
      );
      return {
        success: true,
        message: 'Kode buku berhasil disimpan & buku kini tampil di katalog!',
      };
    }
  };

  // 8c. Update Individual Book Copy (`PATCH /api/admin/book-copies/:id`)
  const updateSingleBookCopy = async (copyId, { copy_code, status }) => {
    const trimmedCode = (copy_code || '').trim();
    if (!trimmedCode) {
      return { success: false, message: 'Kode buku tidak boleh kosong.' };
    }

    try {
      const payload = { copy_code: trimmedCode };
      if (status && status !== 'pending_code') {
        payload.status = status;
      }
      await axiosClient.patch(`/admin/book-copies/${copyId}`, payload);
      await syncFromBackend();
      return { success: true, message: 'Kode eksemplar buku berhasil diperbarui.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui kode buku.',
        };
      }

      setBooks((prev) =>
        prev.map((b) => {
          if (!Array.isArray(b.copies)) return b;
          const hasCopy = b.copies.some((c) => c.id === Number(copyId));
          if (!hasCopy) return b;
          const updatedCopies = b.copies.map((c) =>
            c.id === Number(copyId)
              ? {
                  ...c,
                  copy_code: trimmedCode,
                  status: status && status !== 'pending_code' ? status : 'available',
                }
              : c
          );
          const availCount = updatedCopies.filter((c) => c.status === 'available').length;
          const codedCount = updatedCopies.filter((c) => c.status !== 'pending_code' && Boolean(c.copy_code)).length;
          return {
            ...b,
            copies: updatedCopies,
            available_stock: availCount,
            coded_count: codedCount,
            pending_count: updatedCopies.length - codedCount,
          };
        })
      );
      return { success: true, message: 'Kode eksemplar buku berhasil diperbarui.' };
    }
  };

  // 9. Category CRUD (`POST /api/admin/categories`, `PUT /api/admin/categories/:id`, `DELETE /api/admin/categories/:id`)
  const addCategory = async ({ name, description }) => {
    try {
      const res = await axiosClient.post('/admin/categories', {
        name: name.trim(),
        description: description?.trim() || null,
      });
      await syncFromBackend();
      return {
        success: true,
        category: res.data?.category,
        message: 'Kategori baru berhasil ditambahkan.',
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menambah kategori.',
        };
      }

      const now = new Date().toISOString();
      const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
      const newCat = {
        id: newId,
        name: name.trim(),
        description: description?.trim() || '',
        created_at: now,
        updated_at: now,
      };
      setCategories((prev) => [...prev, newCat]);
      return { success: true, category: newCat, message: 'Kategori baru berhasil ditambahkan.' };
    }
  };

  const updateCategory = async (id, { name, description }) => {
    try {
      await axiosClient.put(`/admin/categories/${id}`, {
        name: name.trim(),
        description: description?.trim() || null,
      });
      await syncFromBackend();
      return { success: true, message: 'Kategori berhasil diperbarui.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui kategori.',
        };
      }

      const now = new Date().toISOString();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === Number(id)
            ? { ...c, name: name.trim(), description: description?.trim() || '', updated_at: now }
            : c
        )
      );
      return { success: true, message: 'Kategori berhasil diperbarui.' };
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axiosClient.delete(`/admin/categories/${id}`);
      await syncFromBackend();
      return { success: true, message: 'Kategori berhasil dihapus.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal menghapus kategori.',
        };
      }

      const hasBooks = books.some((b) => Number(b.category_id) === Number(id));
      if (hasBooks) {
        return {
          success: false,
          message: 'Kategori ini masih digunakan oleh buku dalam katalog.',
        };
      }
      setCategories((prev) => prev.filter((c) => c.id !== Number(id)));
      return { success: true, message: 'Kategori berhasil dihapus.' };
    }
  };

  // 10. Notifications (`PATCH /api/users/notifications/:id/read` & `PATCH /api/users/notifications/read-all`)
  const markNotificationRead = async (notificationId) => {
    try {
      await axiosClient.patch(`/users/notifications/${notificationId}/read`);
    } catch {
      // Offline fallback
    }
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (n.id === Number(notificationId) ? { ...n, read_at: now } : n))
    );
  };

  const markAllNotificationsRead = async (userId) => {
    try {
      await axiosClient.patch('/users/notifications/read-all');
    } catch {
      // Offline fallback
    }
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) =>
        n.user_id === Number(userId) && !n.read_at ? { ...n, read_at: now } : n
      )
    );
  };

  // 11. Settings Update (`PUT /api/admin/settings`)
  const updateSettings = async (newSettings) => {
    const payload = {
      loan_duration_days: String(newSettings.defaultLoanDurationDays),
      max_active_loans: String(newSettings.maxActiveLoansPerUser ?? newSettings.maxBooksPerLoan),
    };

    try {
      const res = await axiosClient.put('/admin/settings', payload);
      if (res.data?.settings) {
        setSettingsRows(res.data.settings);
      }
      return { success: true, message: 'Pengaturan library_settings berhasil disimpan.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui pengaturan.',
        };
      }

      const now = new Date().toISOString();
      const updaterId = currentUser?.id || 1;
      setSettingsRows((prev) =>
        prev.map((row) => {
          if (row.key === 'loan_duration_days' && newSettings.defaultLoanDurationDays !== undefined) {
            return {
              ...row,
              value: String(newSettings.defaultLoanDurationDays),
              updated_by: updaterId,
              updated_at: now,
            };
          }
          if (
            (row.key === 'max_active_loans' || row.key === 'max_books_per_loan') &&
            newSettings.maxBooksPerLoan !== undefined
          ) {
            return {
              ...row,
              value: String(newSettings.maxBooksPerLoan),
              updated_by: updaterId,
              updated_at: now,
            };
          }
          return row;
        })
      );
      return { success: true, message: 'Pengaturan library_settings berhasil disimpan.' };
    }
  };

  const resetLibraryData = () => {
    setBooks(INITIAL_BOOKS);
    setCategories(INITIAL_CATEGORIES);
    setLoans(INITIAL_LOANS);
    setLoanItems(INITIAL_LOAN_ITEMS);
    setLoanStatusHistories(INITIAL_LOAN_STATUS_HISTORIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSettingsRows(INITIAL_LIBRARY_SETTINGS_ROWS);
  };

  return (
    <LibraryContext.Provider
      value={{
        books: enrichedBooks,
        categories,
        loans: enrichedLoans,
        loanStatuses: INITIAL_LOAN_STATUSES,
        loanStatusHistories,
        notifications: enrichedNotifications,
        activityLogs: enrichedActivityLogs,
        settings,
        settingsRows,
        syncFromBackend,
        fetchLoanDetail,
        createLoanRequest,
        cancelLoanRequest,
        approveLoanRequest,
        handoverLoan,
        rejectLoanRequest,
        requestBookReturn,
        confirmBookReturn,
        updateLoanDueDate,
        addBook,
        updateBook,
        deleteBook,
        assignBookCopyCodes,
        updateSingleBookCopy,
        addCategory,
        updateCategory,
        deleteCategory,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetLibraryData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
