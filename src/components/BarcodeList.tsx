import { useState } from 'react';
import { Search, CreditCard as Edit2, Trash2, Check, X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

interface BarcodeListProps {
  items: BarcodeItem[];
  onUpdateItem: (id: string, barcode: string) => void;
  onDeleteItem: (id: string) => void;
}

export function BarcodeList({ items, onUpdateItem, onDeleteItem }: BarcodeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredItems = items.filter(item =>
    item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (item: BarcodeItem) => {
    setEditingId(item.id);
    setEditValue(item.barcode);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdateItem(editingId, editValue.trim());
      setEditingId(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="bg-white dark:bg-[#263d42] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
        Códigos de Barras ({items.length})
      </h2>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar código de barras..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-[#1a3035] dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            {searchTerm ? 'Nenhum código encontrado' : 'Nenhum código escaneado ainda'}
          </p>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#1a3035] rounded-lg hover:bg-slate-100 dark:hover:bg-[#22424a] transition"
            >
              <span className="text-slate-500 dark:text-slate-400 font-mono text-sm min-w-[2rem]">
                {index + 1}.
              </span>

              {editingId === item.id ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-[#1a3035] dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-2 hover:bg-green-50 dark:hover:bg-[#22424a] rounded-lg transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 hover:bg-slate-200 dark:hover:bg-[#22424a] rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-mono text-slate-800 dark:text-slate-200">{item.barcode}</span>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-[#22424a] rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-[#22424a] rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
