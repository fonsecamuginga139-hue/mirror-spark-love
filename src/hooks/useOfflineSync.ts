import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  getPendingOperations, 
  removePendingOperation, 
  getPendingCount 
} from '@/lib/offlineStorage';
import { toast } from 'sonner';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  // Sync pending operations
  const syncPendingOperations = useCallback(async () => {
    if (!navigator.onLine) return;
    
    const operations = await getPendingOperations();
    if (operations.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

    for (const op of operations) {
      try {
        let error: { message: string } | null = null;
        
        // Handle sync based on table type
        if (op.table === 'transactions') {
          switch (op.operation) {
            case 'insert':
              const insertRes = await supabase.from('transactions').insert(op.data);
              error = insertRes.error;
              break;
            case 'update':
              const updateRes = await supabase.from('transactions').update(op.data).eq('id', op.data.id);
              error = updateRes.error;
              break;
            case 'delete':
              const deleteRes = await supabase.from('transactions').delete().eq('id', op.data.id);
              error = deleteRes.error;
              break;
          }
        }

        if (!error) {
          await removePendingOperation(op.id);
          successCount++;
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    setIsSyncing(false);
    await updatePendingCount();

    if (successCount > 0) {
      toast.success(`${successCount} alterações sincronizadas!`);
    }
  }, [updatePendingCount]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Você está online!');
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline', {
        description: 'Suas alterações serão sincronizadas quando voltar online.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending count
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingOperations, updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow: syncPendingOperations,
    updatePendingCount,
  };
};
