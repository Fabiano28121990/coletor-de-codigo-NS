import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type BarcodeList = Database['public']['Tables']['barcode_lists']['Row'];
type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

interface SearchResult {
  type: 'remessa' | 'barcode';
  remessaId: string;
  remessaName: string;
  barcodeId?: string;
  barcodeValue?: string;
}

interface GlobalSearchProps {
  lists: BarcodeList[];
  items: BarcodeItem[];
  onSelectRemessa: (remessaId: string) => void;
  onSelectBarcode?: (barcodeId: string) => void;
}

export function GlobalSearch({
  lists,
  items,
  onSelectRemessa,
  onSelectBarcode
}: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const results: SearchResult[] = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const foundResults: SearchResult[] = [];

    lists.forEach((list) => {
      if (list.name.toLowerCase().includes(term)) {
        foundResults.push({
          type: 'remessa',
          remessaId: list.id,
          remessaName: list.name
        });
      }
    });

    items.forEach((item) => {
      if (item.barcode.toLowerCase().includes(term)) {
        const list = lists.find((l) => l.id === item.list_id);
        if (list) {
          foundResults.push({
            type: 'barcode',
            remessaId: item.list_id,
            remessaName: list.name,
            barcodeId: item.id,
            barcodeValue: item.barcode
          });
        }
      }
    });

    return foundResults;
  }, [searchTerm, lists, items]);

  const handleSelectResult = (result: SearchResult) => {
    onSelectRemessa(result.remessaId);
    if (result.type === 'barcode' && onSelectBarcode && result.barcodeId) {
      onSelectBarcode(result.barcodeId);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
        <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Pesquisar remessa ou código..."
          className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && searchTerm && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.barcodeId || result.remessaId}-${index}`}
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {result.remessaName}
                  </div>
                  {result.type === 'barcode' && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                      {result.barcodeValue}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {result.type === 'remessa' ? 'Remessa' : 'Código de Barras'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && searchTerm && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-4 text-center text-slate-500 dark:text-slate-400">
          Nenhum resultado encontrado
        </div>
      )}

      {showResults && !searchTerm && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
