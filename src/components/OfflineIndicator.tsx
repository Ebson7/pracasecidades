import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-amber-500 animate-bounce">
      <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
      <div className="min-w-0 flex-1">
        <span className="font-bold block">Modo Offline Ativo</span>
        <span className="text-[11px] text-amber-100 block">
          Você está sem internet. O app continua funcionando com os dados locais salvos.
        </span>
      </div>
    </div>
  );
};
