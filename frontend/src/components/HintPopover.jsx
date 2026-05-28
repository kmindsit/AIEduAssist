import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import Button from './Button';

export default function HintPopover({ hint, onClose, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">💡 Hint</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 text-sm">{hint}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                fullWidth
                className="flex items-center justify-center gap-1"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy Hint'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                fullWidth
              >
                Got it!
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Hints remaining: 2/3
            </p>
          </>
        )}
      </div>
    </div>
  );
}
