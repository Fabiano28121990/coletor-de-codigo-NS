import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { ListManager } from './ListManager';
import { BarcodeList } from './BarcodeList';
import { ExportShareButtons } from './ExportShareButtons';
import { GlobalSearch } from './GlobalSearch';
import { LogOut, Moon, Sun } from 'lucide-react';
import type { Database } from '../lib/database.types';

type BarcodeList = Database['public']['Tables']['barcode_lists']['Row'];
type BarcodeItem = Database['public']['Tables']['barcode_items']['Row'];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lists, setLists] = useState<BarcodeList[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [items, setItems] = useState<BarcodeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (currentListId) {
      loadItems(currentListId);
    } else {
      setItems([]);
    }
  }, [currentListId]);

  const loadLists = async () => {
    try {
      const { data, error } = await supabase
        .from('barcode_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);

      if (data && data.length > 0 && !currentListId) {
        setCurrentListId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('barcode_items')
        .select('*')
        .eq('list_id', listId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleCreateList = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('barcode_lists')
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLists([data, ...lists]);
        setCurrentListId(data.id);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta remessa e todos os seus códigos?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('barcode_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      const newLists = lists.filter((list) => list.id !== listId);
      setLists(newLists);

      if (currentListId === listId) {
        setCurrentListId(newLists.length > 0 ? newLists[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    if (!currentListId) {
      alert('Por favor, selecione ou crie uma remessa primeiro.');
      return;
    }

    try {
      const maxOrderIndex = items.length > 0
        ? Math.max(...items.map((item) => item.order_index))
        : 0;

      const { data, error } = await supabase
        .from('barcode_items')
        .insert({
          list_id: currentListId,
          barcode,
          order_index: maxOrderIndex + 1
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setItems([...items, data]);
      }
    } catch (error) {
      console.error('Error adding barcode:', error);
    }
  };

  const handleUpdateItem = async (id: string, barcode: string) => {
    try {
      const { error } = await supabase
        .from('barcode_items')
        .update({ barcode })
        .eq('id', id);

      if (error) throw error;

      setItems(items.map((item) => (item.id === id ? { ...item, barcode } : item)));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('barcode_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteAllItems = async () => {
    if (!currentListId) return;

    try {
      const { error } = await supabase
        .from('barcode_items')
        .delete()
        .eq('list_id', currentListId);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error deleting all items:', error);
    }
  };

  const currentList = lists.find((list) => list.id === currentListId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#19282A] dark:to-[#1a3035]">
      <header className="bg-white dark:bg-[#19282A] shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Gerenciador de Códigos de Barras
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 max-w-sm">
          <GlobalSearch
            lists={lists}
            items={items}
            onSelectRemessa={setCurrentListId}
            onSelectBarcode={() => {}}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ListManager
              lists={lists}
              currentListId={currentListId}
              onSelectList={setCurrentListId}
              onCreateList={handleCreateList}
              onDeleteList={handleDeleteList}
            />
          </div>

          <div className="space-y-6">
            {currentListId && (
              <>
                <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
              </>
            )}

            {!currentListId && (
              <div className="bg-white dark:bg-[#263d42] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Crie ou selecione uma remessa para começar a escanear códigos de barras.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {currentListId && (
              <>
                <ExportShareButtons
                  items={items}
                  listName={currentList?.name || 'Remessa'}
                  onDeleteAll={handleDeleteAllItems}
                />
                <BarcodeList
                  items={items}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
