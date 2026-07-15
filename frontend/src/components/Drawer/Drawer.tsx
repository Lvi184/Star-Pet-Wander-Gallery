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
        className="absolute inset-0 bg-black/70 transition-opacity duration-300 pointer-events-auto"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 bottom-0 pixel-box pointer-events-auto transform transition-transform duration-300 ease-out overflow-hidden flex flex-col"
        style={{ width, maxWidth: '90vw', background: '#181425' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-clay-700 flex-shrink-0 bg-clay-800/80">
          <h2 className="font-display text-lg text-brown-200 shadow-solid">{title}</h2>
          <button
            onClick={onClose}
            className="pixel-button w-8 h-8 flex items-center justify-center text-clay-300 hover:text-brown-100 transition-all"
            aria-label="关闭"
          >
            <span>✕</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
