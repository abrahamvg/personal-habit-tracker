'use client';

import Modal from './ui/Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { key: 'N', description: 'Add new habit' },
    { key: '?', description: 'Show shortcuts (this modal)' },
    { key: 'Esc', description: 'Close modals' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⌨️ Keyboard Shortcuts">
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between p-3 bg-beige-50 dark:bg-dark-hover rounded-lg hover:bg-beige-100 dark:hover:bg-dark-border transition-colors"
          >
            <span className="text-sm text-sand-900 dark:text-dark-text-primary">
              {shortcut.description}
            </span>
            <kbd className="px-3 py-1.5 bg-white dark:bg-dark-card border border-sand-200 dark:border-dark-border rounded text-sm font-mono font-semibold text-sand-700 dark:text-dark-text-primary shadow-sm">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-200 text-center">
          💡 <strong>Pro tip:</strong> Most shortcuts work from anywhere in the app!
        </p>
      </div>
    </Modal>
  );
}
