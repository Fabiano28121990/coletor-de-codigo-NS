import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

export function exportToTXT(items: BarcodeItem[], listName: string): void {
  const content = items.map((item, index) => `${index + 1}. ${item.barcode}`).join('\n');
  downloadFile(content, `${listName}.txt`, 'text/plain');
}

export function exportToHTML(items: BarcodeItem[], listName: string): void {
  const rows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${item.barcode}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${new Date(item.created_at).toLocaleString('pt-BR')}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${listName}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: left;
      border: 1px solid #2563eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${listName}</h1>
    <p>Total de códigos: ${items.length}</p>
    <table>
      <thead>
        <tr>
          <th style="width: 80px;">#</th>
          <th>Código de Barras</th>
          <th style="width: 200px;">Data/Hora</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;

  downloadFile(html, `${listName}.html`, 'text/html');
}

export function exportToXLSX(items: BarcodeItem[], listName: string): void {
  const csvContent = [
    ['#', 'Código de Barras', 'Data/Hora'].join(','),
    ...items.map((item, index) =>
      [index + 1, item.barcode, new Date(item.created_at).toLocaleString('pt-BR')].join(',')
    )
  ].join('\n');

  downloadFile('\ufeff' + csvContent, `${listName}.csv`, 'text/csv;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
