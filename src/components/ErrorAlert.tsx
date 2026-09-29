import React from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
  onOpenSettings: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onRetry,
  isRetrying,
  onOpenSettings,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 my-4 text-rose-950 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-900 mb-1">
            Não foi possível carregar os dados atualizados
          </h4>
          <p className="text-xs text-rose-800 leading-relaxed mb-3">
            {message}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>

            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-rose-100/50 text-rose-800 text-xs font-bold border border-rose-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Verificar link da planilha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
