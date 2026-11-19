import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex max-w-sm flex-col gap-2.5">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 ${
                isError
                  ? 'border-rose-200 bg-white/95 text-rose-900'
                  : isInfo
                  ? 'border-[#89CFF3] bg-[#CDF5FD]/95 text-slate-900'
                  : 'border-[#89CFF3] bg-white/95 text-slate-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                ) : isInfo ? (
                  <Info className="h-5 w-5 text-[#00A9FF]" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-[#00A9FF]" />
                )}
              </div>
              <div className="flex-1 text-sm">
                {toast.title && <p className="font-bold text-slate-900">{toast.title}</p>}
                <p className="font-medium leading-snug text-slate-700">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
