import { Download, Share2, FileText, FileCode, Table, Printer, Trash2, Send } from 'lucide-react';
import { useState } from 'react';
import { exportToTXT, exportToHTML, exportToXLSX } from '../utils/export';
import { shareViaWhatsApp, shareViaEmail, shareToGoogleDrive, shareToOneDrive } from '../utils/share';
import { printBarcodes } from '../utils/print';
import { SendRemessaModal } from './SendRemessaModal';
import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

interface ExportShareButtonsProps {
  items: BarcodeItem[];
  listName: string;
  onDeleteAll?: () => void;
}

export function ExportShareButtons({ items, listName, onDeleteAll }: ExportShareButtonsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const handleDeleteAll = () => {
    if (confirm(`Tem certeza que deseja apagar todos os ${items.length} códigos desta remessa?`)) {
      onDeleteAll?.();
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <SendRemessaModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        items={items}
        listName={listName}
      />
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-wrap gap-3">
        <div className="relative">
          <button
            onClick={() => {
              printBarcodes(items, listName);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowShareMenu(false);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
          >
            <Download className="w-5 h-5" />
            Exportar
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

        <div className="relative">
          <button
            onClick={() => {
              setShowShareMenu(!showShareMenu);
              setShowExportMenu(false);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar
          </button>

          {showShareMenu && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                onClick={() => {
                  shareViaWhatsApp(items, listName);
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 border-b border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  shareViaEmail(items, listName);
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 border-b border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>Email</span>
              </button>
              <button
                onClick={() => {
                  shareToGoogleDrive(items, listName);
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 border-b border-slate-100 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.01 1.485L2.05 16.95h3.475l5.485-9.49 5.485 9.49h3.475L9.545 1.485a1.5 1.5 0 00-2.595 0h-.94zm-1.73 15.465L5.02 22.515h13.96L14.74 16.95H10.28z"/>
                </svg>
                <span>Google Drive</span>
              </button>
              <button
                onClick={() => {
                  shareToOneDrive(items, listName);
                  setShowShareMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center gap-3 rounded-b-lg text-slate-700 dark:text-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.8 16.8c-.3 0-.6-.2-.7-.5-.1-.3 0-.6.2-.8l2.7-2c.3-.2.8-.2 1.1.1.3.3.3.7 0 1l-2.7 2c-.2.2-.4.2-.6.2z"/>
                  <path d="M22.5 14.5c-.6-2-2.4-3.5-4.6-3.5-1 0-2 .3-2.8.9-.7-2.2-2.7-3.7-5-3.7-2.9 0-5.3 2.4-5.3 5.3 0 .3 0 .6.1.9C2.3 15 .5 17.2.5 19.8c0 3.1 2.5 5.7 5.7 5.7h11.6c3.1 0 5.7-2.5 5.7-5.7 0-2.3-1.4-4.3-3.5-5.3z"/>
                </svg>
                <span>OneDrive</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSendModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
        >
          <Send className="w-5 h-5" />
          Enviar
        </button>

        <button
          onClick={handleDeleteAll}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Apagar Tudo
        </button>
      </div>
    </div>
    </>
  );
}
