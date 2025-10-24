'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requiresTyping?: boolean;
  typingText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  requiresTyping = false,
  typingText = 'DELETE',
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
    setInputValue('');
    onClose();
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  const canConfirm = !requiresTyping || inputValue === typingText;

  const typeColors = {
    danger: {
      bg: 'bg-red-600',
      hover: 'hover:bg-red-700',
      border: 'border-red-500',
      text: 'text-red-600',
    },
    warning: {
      bg: 'bg-orange-600',
      hover: 'hover:bg-orange-700',
      border: 'border-orange-500',
      text: 'text-orange-600',
    },
    info: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      border: 'border-blue-500',
      text: 'text-blue-600',
    },
  };

  const colors = typeColors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full ${colors.bg} bg-opacity-10 flex items-center justify-center mb-4`}>
                {type === 'danger' && (
                  <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {type === 'warning' && (
                  <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {type === 'info' && (
                  <svg className={`w-6 h-6 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>

              {/* Message */}
              <p className="text-slate-600 mb-6">{message}</p>

              {/* Typing Confirmation */}
              {requiresTyping && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type <span className="font-mono font-bold">{typingText}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`w-full px-4 py-2 border-2 ${
                      inputValue && inputValue !== typingText ? colors.border : 'border-slate-300'
                    } rounded-lg focus:outline-none focus:border-${type}-500`}
                    placeholder={typingText}
                    autoFocus
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isConfirming}
                  className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canConfirm || isConfirming}
                  className={`flex-1 px-4 py-2 ${colors.bg} ${colors.hover} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isConfirming ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
