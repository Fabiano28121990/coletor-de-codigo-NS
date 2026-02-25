import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

interface SendRemessaModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: BarcodeItem[];
  listName: string;
}

export function SendRemessaModal({ isOpen, onClose, items, listName }: SendRemessaModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [remessaNumber, setRemessaNumber] = useState('');

  if (!isOpen) return null;

  const generateTXTContent = () => {
    const header = `REMESSA #${remessaNumber || 'TEMP'}\n`;
    const email = `E-mail: ${user?.email || 'N/A'}\n`;
    const date = `Data: ${new Date().toLocaleString('pt-BR')}\n`;
    const total = `Total de Códigos: ${items.length}\n`;
    const separator = `${'='.repeat(60)}\n\n`;

    const barcodes = items
      .map((item, index) => `${index + 1}. ${item.barcode}`)
      .join('\n');

    return `${header}${email}${date}${total}${separator}${barcodes}`;
  };

  const handleSend = async () => {
    if (!remessaNumber.trim()) {
      setError('Por favor, insira o número da remessa');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const fileContent = generateTXTContent();
      const filename = `remessa_${remessaNumber}_${user?.email?.split('@')[0] || 'usuario'}.txt`;

      const { data: credentials } = await supabase
        .from('google_drive_credentials')
        .select('access_token')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!credentials?.access_token) {
        setError('Você não tem credenciais do Google Drive configuradas. Por favor, faça login com Google primeiro.');
        setLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-drive-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename,
            content: fileContent,
            access_token: credentials.access_token,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar arquivo');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRemessaNumber('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar remessa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Enviar Remessa</h2>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <div className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400">✓</div>
              <p className="text-green-700 dark:text-green-400 font-medium">
                Remessa enviada com sucesso para o Google Drive!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Número da Remessa
            </label>
            <input
              type="text"
              value={remessaNumber}
              onChange={(e) => setRemessaNumber(e.target.value)}
              placeholder="Ex: 2025-001"
              disabled={loading || success}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition disabled:opacity-50"
            />
          </div>

          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Resumo da remessa:</span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>✓ Nome: {listName}</li>
              <li>✓ Email: {user?.email}</li>
              <li>✓ Total de códigos: {items.length}</li>
              <li>✓ Arquivo: remessa_{remessaNumber || 'TEMP'}_*.txt</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              O arquivo será enviado diretamente para seu Google Drive associado à conta de login.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !remessaNumber.trim()}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
