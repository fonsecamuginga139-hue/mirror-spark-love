import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallPrompt = ({ isOpen, onClose }: InstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }

    setDeferredPrompt(null);
    setIsInstalling(false);
    onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onClose();
  };

  if (!isOpen) return null;

  // If already installed or no prompt available, don't show
  const isInstalled = localStorage.getItem('pwa-installed') === 'true';
  const isDismissed = localStorage.getItem('pwa-install-dismissed');
  
  // Don't show if dismissed less than 7 days ago
  if (isDismissed) {
    const dismissedTime = parseInt(isDismissed);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime < sevenDays) {
      return null;
    }
  }

  if (isInstalled) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full overflow-hidden animate-scale-in shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <Smartphone size={32} className="text-primary-foreground" />
          </div>
          
          <h2 className="text-xl font-bold text-foreground">
            Instale o Vault
          </h2>
          <p className="text-muted-foreground mt-1">
            Acesso rápido e seguro às suas finanças
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Acesso instantâneo</p>
                <p className="text-sm text-muted-foreground">Abra direto da tela inicial</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Funciona offline</p>
                <p className="text-sm text-muted-foreground">Use mesmo sem internet</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Experiência nativa</p>
                <p className="text-sm text-muted-foreground">Visual e desempenho de app</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Agora não
            </button>
            {deferredPrompt ? (
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Download size={18} />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 btn-primary"
              >
                Entendi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
