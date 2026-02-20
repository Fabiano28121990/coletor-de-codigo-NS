import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

export function printBarcodes(items: BarcodeItem[], listName: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 12px; border: 1px solid #ddd; text-align: center; width: 60px;">${index + 1}</td>
      <td style="padding: 12px; border: 1px solid #ddd; font-family: 'Courier New', monospace; font-size: 14px;">${item.barcode}</td>
      <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 12px; color: #666;">${new Date(item.created_at).toLocaleString('pt-BR')}</td>
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
  <title>Impressão - ${listName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background: white;
      color: #333;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
    }

    .header h1 {
      font-size: 28px;
      color: #1f2937;
      margin-bottom: 10px;
    }

    .header p {
      color: #666;
      font-size: 14px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 13px;
      color: #666;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    thead {
      background-color: #3b82f6;
      color: white;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }

    tbody tr:hover {
      background-color: #e0e7ff;
    }

    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }

    @media print {
      body {
        padding: 0;
      }

      .footer {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 ${listName}</h1>
      <p>Relatório de Códigos de Barras</p>
    </div>

    <div class="info-row">
      <span><strong>Total de Códigos:</strong> ${items.length}</span>
      <span><strong>Data de Impressão:</strong> ${new Date().toLocaleString('pt-BR')}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 80px;">#</th>
          <th>Código de Barras</th>
          <th style="width: 150px;">Data/Hora</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="footer">
      <p>Impresso automaticamente pelo Sistema de Gerenciamento de Códigos de Barras</p>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      window.print();
      window.addEventListener('afterprint', () => {
        window.close();
      });
    });
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
