import { Download, Share2, FileText, FileCode, Table, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { exportToTXT, exportToHTML, exportToXLSX } from '../utils/export';
import { printBarcodes } from '../utils/print';
import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

interface ExportShareButtonsProps {
  items: BarcodeItem[];
  listName: string;
  onDeleteAll?: () => void;
}

export function ExportShareButtons({ items, listName, onDeleteAll }: ExportShareButtonsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleDeleteAll = () => {
    if (confirm(`Tem certeza que deseja apagar todos os ${items.length} códigos desta remessa?`)) {
      onDeleteAll?.();
    }
  };

  const handleNativeShare = async () => {
    const barcodes = items.map(item => item.barcode).join('\n');
    const shareData = {
      title: `Remessa: ${listName}`,
      text: `Códigos da remessa "${listName}":\n\n${barcodes}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        console.warn('Web Share API não suportada neste navegador');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <button
            onClick={() => {
              printBarcodes(items, listName);
            }}
            className="bg-[#19282A] hover:opacity-80 text-[#C7FF41] p-2 rounded-lg transition flex items-center gap-2 font-medium"
            title="Imprimir"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
            }}
            className="bg-[#19282A] hover:opacity-80 text-[#C7FF41] p-2 rounded-lg transition flex items-center gap-2 font-medium"
            title="Exportar"
          >
            <Download className="w-5 h-5" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                onClick={() => {
                  exportToTXT(items, listName);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 border-b border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <FileText className="w-4 h-4" />
                <span>Exportar TXT</span>
              </button>
              <button
                onClick={() => {
                  exportToHTML(items, listName);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 border-b border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <FileCode className="w-4 h-4" />
                <span>Exportar HTML</span>
              </button>
              <button
                onClick={() => {
                  exportToXLSX(items, listName);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 rounded-b-lg text-slate-700 dark:text-slate-200"
              >
                <Table className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleNativeShare}
          className="bg-[#19282A] hover:opacity-80 text-[#C7FF41] p-2 rounded-lg transition flex items-center gap-2 font-medium"
          title="Compartilhar"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <button
          onClick={handleDeleteAll}
          className="bg-[#19282A] hover:opacity-80 text-[#C7FF41] p-2 rounded-lg transition flex items-center gap-2 font-medium"
          title="Apagar Tudo"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
