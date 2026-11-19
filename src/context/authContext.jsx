import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { INITIAL_USERS } from '../mocks/mockData';
import { ROLES, NIM_STATUS } from '../utils/constants';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'unipus_users_v4';
const CURRENT_USER_KEY = 'unipus_current_user_v4';
const TOKEN_STORAGE_KEY = 'unipus_token';

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const isStaffRole = (role) => {
    const r = (role || '').toLowerCase();
    return r === ROLES.ADMIN || r === ROLES.PETUGAS;
  };

  // Sync profile & admin user list from Backend when token exists
  const fetchAdminUsers = useCallback(async () => {
    try {
      const res = await axiosClient.get('/admin/users');
      if (res.data?.users) {
        setUsers(res.data.users);
      }
    } catch {
      // Fallback to local state if backend is offline
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return;

    axiosClient
      .get('/users/me')
      .then((res) => {
        if (res.data?.user) {
          setCurrentUser(res.data.user);
        }
      })
      .catch(() => {
        // Keep cached user if backend is unreachable
      });
  }, []);

  useEffect(() => {
    if (currentUser && isStaffRole(currentUser.role)) {
      fetchAdminUsers();
    }
  }, [currentUser, fetchAdminUsers]);

  // 1. Login (`POST /api/auth/login`)
  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await axiosClient.post('/auth/login', {
        email: normalizedEmail,
        password,
      });
      const { user, token } = res.data;
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      // If Backend responded with 4xx/5xx error
      if (err.response) {
        return {
          success: false,
          message:
            err.response.data?.message ||
            'Email atau password tidak valid.',
        };
      }

      // Offline fallback if Backend server (localhost:3400) is not running yet
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail &&
          (u.password_hash === password || u.password === password)
      );

      if (!found) {
        return {
          success: false,
          message: 'Email atau password tidak valid. Silakan periksa kembali kredensial Anda.',
        };
      }

      if (found.is_active === false) {
        return {
          success: false,
          message: 'Akun Anda sedang dinonaktifkan oleh Admin Perpustakaan.',
        };
      }

      const { password_hash: _, password: __, ...safeUser } = found;
      setCurrentUser(safeUser);
      return { success: true, user: safeUser };
    }
  };

  // 2. Register (`POST /api/auth/register`)
  const register = async ({ name, nim, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNim = nim ? nim.trim() : null;

    try {
      const res = await axiosClient.post('/auth/register', {
        name: name.trim(),
        email: normalizedEmail,
        password,
        nim: normalizedNim,
      });
      const { user, token } = res.data;
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message:
            err.response.data?.message ||
            'Registrasi gagal. Email atau NIM mungkin sudah terdaftar.',
        };
      }

      // Offline fallback
      const emailExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
      if (emailExists) {
        return {
          success: false,
          message: 'Alamat email tersebut sudah terdaftar di sistem Unipus.',
        };
      }

      if (normalizedNim) {
        const nimExists = users.some(
          (u) => (u.nim || '').toLowerCase() === normalizedNim.toLowerCase()
        );
        if (nimExists) {
          return {
            success: false,
            message: 'NIM tersebut sudah terdaftar di sistem Unipus.',
          };
        }
      }

      const now = new Date().toISOString();
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: name.trim(),
        email: normalizedEmail,
        password_hash: password,
        is_active: true,
        role: ROLES.USER,
        created_at: now,
        updated_at: now,
        nim: normalizedNim,
        nim_status: normalizedNim ? NIM_STATUS.PENDING : NIM_STATUS.NONE,
        nim_reviewed_by: null,
        nim_review_note: null,
        nim_reviewed_at: null,
      };

      setUsers((prev) => [...prev, newUser]);
      const { password_hash: _, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      return { success: true, user: safeUser };
    }
  };

  // 3. Logout (`POST /api/auth/logout`)
  const logout = async () => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        await axiosClient.post('/auth/logout');
      }
    } catch {
      // Ignore network/token error on logout
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setCurrentUser(null);
    }
  };

  // 4. Update Profile (`PUT /api/users/me` & `PATCH /api/users/me/nim`)
  const updateProfile = async (updates) => {
    if (!currentUser) return { success: false, message: 'Tidak ada sesi aktif' };

    const updatedNim = updates.nim !== undefined ? updates.nim.trim() : currentUser.nim;
    const nimChanged = updatedNim && updatedNim !== currentUser.nim;

    try {
      let latestUser = { ...currentUser };

      // A. Update Name / Password via `PUT /api/users/me`
      const profilePayload = {};
      if (updates.name && updates.name.trim() !== currentUser.name) {
        profilePayload.name = updates.name.trim();
      }
      if (updates.newPassword) {
        profilePayload.current_password = updates.currentPassword || '';
        profilePayload.new_password = updates.newPassword;
      }

      if (Object.keys(profilePayload).length > 0) {
        const res = await axiosClient.put('/users/me', profilePayload);
        if (res.data?.user) {
          latestUser = { ...latestUser, ...res.data.user };
        }
      }

      // B. Submit / Update NIM via `PATCH /api/users/me/nim`
      if (nimChanged && !isStaffRole(currentUser.role)) {
        const nimRes = await axiosClient.patch('/users/me/nim', {
          nim: updatedNim,
        });
        if (nimRes.data?.user) {
          latestUser = { ...latestUser, ...nimRes.data.user };
        }
      }

      setCurrentUser(latestUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === latestUser.id ? { ...u, ...latestUser } : u))
      );
      return { success: true, user: latestUser };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memperbarui profil.',
        };
      }

      // Offline fallback
      const now = new Date().toISOString();
      const nextNimStatus =
        nimChanged && updatedNim
          ? NIM_STATUS.PENDING
          : !updatedNim
          ? NIM_STATUS.NONE
          : currentUser.nim_status;

      const updatedSafeUser = {
        ...currentUser,
        name: updates.name?.trim() || currentUser.name,
        email: updates.email?.trim().toLowerCase() || currentUser.email,
        nim: updatedNim || null,
        nim_status: nextNimStatus,
        updated_at: now,
      };

      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                ...updatedSafeUser,
                password_hash: updates.newPassword || u.password_hash,
              }
            : u
        )
      );
      setCurrentUser(updatedSafeUser);
      return { success: true, user: updatedSafeUser };
    }
  };

  // 5. Admin Review User NIM (`PATCH /api/admin/users/:id/nim-review`)
  const reviewUserNim = async (targetUserId, { status, note = '' }) => {
    try {
      const res = await axiosClient.patch(`/admin/users/${targetUserId}/nim-review`, {
        status,
        note: note.trim() || null,
      });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === Number(targetUserId) ? { ...u, ...updatedUser } : u))
        );
      }
      return {
        success: true,
        message:
          status === NIM_STATUS.APPROVED
            ? 'NIM pengguna berhasil disetujui (Approved).'
            : 'NIM pengguna telah ditolak (Rejected).',
      };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal memproses verifikasi NIM.',
        };
      }

      // Offline fallback
      const now = new Date().toISOString();
      const reviewerId = currentUser?.id || 1;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === Number(targetUserId)
            ? {
                ...u,
                nim_status: status,
                nim_reviewed_by: reviewerId,
                nim_review_note:
                  note.trim() ||
                  (status === NIM_STATUS.APPROVED
                    ? 'NIM Terverifikasi oleh Admin'
                    : 'NIM Ditolak'),
                nim_reviewed_at: now,
                updated_at: now,
              }
            : u
        )
      );
      return {
        success: true,
        message:
          status === NIM_STATUS.APPROVED
            ? 'NIM pengguna berhasil disetujui (Approved).'
            : 'NIM pengguna telah ditolak (Rejected).',
      };
    }
  };

  // 6. Admin Toggle User Status (`PATCH /api/admin/users/:id/status`)
  const toggleUserActive = async (targetUserId) => {
    const target = users.find((u) => u.id === Number(targetUserId));
    const nextActive = target ? !target.is_active : true;

    try {
      const res = await axiosClient.patch(`/admin/users/${targetUserId}/status`, {
        is_active: nextActive,
      });
      const updatedUser = res.data?.user;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === Number(targetUserId)
            ? { ...u, is_active: updatedUser ? updatedUser.is_active : nextActive }
            : u
        )
      );
      return { success: true, message: 'Status aktif pengguna berhasil diperbarui.' };
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Gagal mengubah status pengguna.',
        };
      }

      const now = new Date().toISOString();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === Number(targetUserId)
            ? { ...u, is_active: nextActive, updated_at: now }
            : u
        )
      );
      return { success: true, message: 'Status aktif pengguna berhasil diperbarui.' };
    }
  };

  const resetUsersToDefault = () => {
    setUsers(INITIAL_USERS);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: isStaffRole(currentUser?.role),
        login,
        register,
        logout,
        updateProfile,
        reviewUserNim,
        toggleUserActive,
        fetchAdminUsers,
        resetUsersToDefault,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
