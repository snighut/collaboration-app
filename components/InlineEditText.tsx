import React, { useState } from 'react';
import { Pencil, Loader2 } from 'lucide-react';

interface InlineEditTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  loading?: boolean;
  editable?: boolean;
  className?: string;
}

const InlineEditText: React.FC<InlineEditTextProps> = ({
  value,
  onSave,
  loading = false,
  editable = true,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showEditIcon, setShowEditIcon] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    await onSave(inputValue.trim());
    setIsEditing(false);
  };

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setShowEditIcon(true)}
      onMouseLeave={() => setShowEditIcon(false)}
      onTouchStart={() => setShowEditIcon(true)}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
            disabled={loading}
            className="bg-transparent border-b border-blue-400 text-lg font-bold px-1 outline-none w-40"
          />
          <button
            type="submit"
            disabled={loading}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
            title="Save title"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save'}
          </button>
          <button
            type="button"
            className="ml-1 text-gray-500 hover:text-gray-700"
            onClick={() => setIsEditing(false)}
            title="Cancel"
          >
            Cancel
          </button>
        </form>
      ) : (
        <span className="truncate text-lg font-bold flex items-center gap-2">
          {value}
          {editable && showEditIcon && (
            <button
              className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => {
                setIsEditing(true);
                setInputValue(value);
              }}
              title="Edit title"
            >
              <Pencil size={18} />
            </button>
          )}
        </span>
      )}
    </div>
  );
};

export default InlineEditText;
