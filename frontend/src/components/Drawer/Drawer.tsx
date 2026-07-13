import { ReactNode, useEffect } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export default function Drawer({ open, onClose, title, children, width = '400px' }: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 bottom-0 glass-dark border-l border-cosmos-700/50 pointer-events-auto transform transition-transform duration-300 ease-out overflow-hidden flex flex-col"
        style={{ width, maxWidth: '90vw' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-cosmos-800/50 flex-shrink-0">
          <h2 className="text-lg font-bold text-gradient-cosmos">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cosmos-400 hover:text-white hover:bg-cosmos-800/50 transition-all"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
