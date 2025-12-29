'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Reusable modal component with consistent backdrop and animations
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-sand-900/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className={`card w-full ${widthClasses[maxWidth]} p-6 animate-in zoom-in-95 duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-sand-900 dark:text-dark-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-beige-200 dark:hover:bg-dark-hover rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-sand-600 dark:text-dark-text-secondary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
