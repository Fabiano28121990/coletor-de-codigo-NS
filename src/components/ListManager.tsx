import { useState } from 'react';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type BarcodeList = Database['public']['Tables']['barcode_lists']['Row'];

interface ListManagerProps {
  lists: BarcodeList[];
  currentListId: string | null;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string) => void;
  onDeleteList: (listId: string) => void;
}

export function ListManager({
  lists,
  currentListId,
  onSelectList,
  onCreateList,
  onDeleteList
}: ListManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreate = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#263d42] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-lg">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Remessas</h2>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition flex items-center gap-2 text-sm font-medium"
          title="Nova Remessa"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nome da remessa"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-600 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              Criar
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewListName('');
              }}
              className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg transition text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {lists.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            Nenhuma remessa criada ainda. Crie sua primeira remessa!
          </p>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition cursor-pointer ${
                currentListId === list.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              onClick={() => onSelectList(list.id)}
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">{list.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(list.id);
                }}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
