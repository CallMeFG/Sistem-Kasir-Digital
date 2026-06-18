import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 3500) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
  }, []);

  const toast = {
    success: (title, msg) => addToast('success', title, msg),
    error:   (title, msg) => addToast('error', title, msg),
    warning: (title, msg) => addToast('warning', title, msg),
    info:    (title, msg) => addToast('info', title, msg),
  };

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.removing ? ' removing' : ''}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <div className="toast-body">
              {t.title && <div className="toast-title">{t.title}</div>}
              {t.message && <div style={{ opacity: 0.85, fontSize: '12.5px' }}>{t.message}</div>}
            </div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai dalam ToastProvider');
  return ctx;
}
