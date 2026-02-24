import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

export function shareViaWhatsApp(items: BarcodeItem[], listName: string): void {
  const text = formatItemsForSharing(items, listName);
  const encodedText = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}

export function shareViaEmail(items: BarcodeItem[], listName: string): void {
  const subject = encodeURIComponent(`Lista de Códigos: ${listName}`);
  const body = encodeURIComponent(formatItemsForSharing(items, listName));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function shareToGoogleDrive(items: BarcodeItem[], listName: string): void {
  const text = formatItemsForSharing(items, listName);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const url = isMobile
    ? 'https://drive.google.com/drive/mobile'
    : 'https://drive.google.com/drive/my-drive';

  window.open(url, '_blank');

  alert('O arquivo foi preparado. Faça upload manualmente no Google Drive que foi aberto.');
}

export function shareToOneDrive(items: BarcodeItem[], listName: string): void {
  const url = 'https://onedrive.live.com/';
  window.open(url, '_blank');

  alert('O OneDrive foi aberto. Faça upload do arquivo manualmente.');
}

function formatItemsForSharing(items: BarcodeItem[], listName: string): string {
  const header = `${listName}\n${'='.repeat(listName.length)}\n\nTotal: ${items.length} códigos\n\n`;
  const itemsList = items
    .map((item, index) => `${index + 1}. ${item.barcode}`)
    .join('\n');
  return header + itemsList;
}
