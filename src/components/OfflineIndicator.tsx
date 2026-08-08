import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();

  if (isOnline && !isSyncing && pendingCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {!isOnline ? (
        <div className="bg-amber-500/90 backdrop-blur-sm text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff size={16} />
          <span>Você está offline. As alterações serão sincronizadas automaticamente.</span>
          {pendingCount > 0 && (
            <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      ) : isSyncing ? (
        <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          <RefreshCw size={16} className="animate-spin" />
          <span>Sincronizando dados...</span>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
