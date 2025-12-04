// src/components/admin/products/EditProductTabs/SymbolPickerDialog.tsx
'use client';

import { useState, useEffect } from 'react';

interface SymbolPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYMBOLS = [
  '±',
  '°',
  'Φ',
  'φ',
  'Ω',
  'ω',
  'µ',
  'π',
  '≈',
  '≠',
  '≤',
  '≥',
  '√',
  '∞',
  '∆',
  'Σ',
  'α',
  'β',
  'γ',
  'δ',
  'ε',
  'λ',
  'θ',
  'τ',
  '²',
  '³',
  '→',
  '←',
  '↑',
  '↓',
  '↔',
];

export default function SymbolPickerDialog({
  isOpen,
  onClose,
}: SymbolPickerDialogProps) {
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  useEffect(() => {
    if (copiedSymbol) {
      const timer = setTimeout(() => setCopiedSymbol(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedSymbol]);

  if (!isOpen) return null;

  const handleSymbolClick = (symbol: string) => {
    navigator.clipboard
      .writeText(symbol)
      .then(() => {
        setCopiedSymbol(symbol);
        setTimeout(() => {
          onClose(); // Tự động đóng dialog sau khi copy
        }, 500); // Đợi 0.5s để người dùng thấy hiệu ứng "Copied!"
      })
      .catch((err) => {
        console.error('Failed to copy symbol: ', err);
      });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Select a Symbol
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="mt-4 grid grid-cols-8 gap-2">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => handleSymbolClick(symbol)}
              className="relative flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-xl font-mono text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {symbol}
              {copiedSymbol === symbol && (
                <span className="absolute -top-6 rounded-md bg-green-600 px-2 py-0.5 text-xs font-sans text-white">
                  Copied!
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Click a symbol to copy it to the clipboard.
        </p>
      </div>
    </div>
  );
}
