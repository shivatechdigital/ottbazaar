import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastValue {
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2 w-[min(92vw,360px)]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className={`rounded-xl px-4 py-3 text-sm shadow-2xl border backdrop-blur-md ${
                t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                  : t.type === 'info'
                    ? 'bg-indigo-950/90 border-indigo-400/30 text-indigo-100'
                    : 'bg-emerald-950/90 border-emerald-400/30 text-emerald-100'
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
