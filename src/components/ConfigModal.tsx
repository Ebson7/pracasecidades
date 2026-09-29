import React, { useState } from 'react';
import { X, ExternalLink, Check, AlertCircle, FileSpreadsheet, RotateCcw, Link2 } from 'lucide-react';
import { DATA_URL } from '../config';
import { getEffectiveDataUrl, setCustomDataUrl } from '../services/dataService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndRefresh: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onApplyAndRefresh,
}) => {
  const [currentUrl, setCurrentUrl] = useState(getEffectiveDataUrl());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const isDefaultPlaceholder = currentUrl.includes('COLE_AQUI_O_LINK_CSV_DO_GOOGLE_SHEETS');

  const handleSave = () => {
    if (currentUrl.trim() === DATA_URL || !currentUrl.trim()) {
      setCustomDataUrl(null);
    } else {
      setCustomDataUrl(currentUrl.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onApplyAndRefresh();
      onClose();
    }, 800);
  };

  const handleResetToConfig = () => {
    setCustomDataUrl(null);
    setCurrentUrl(DATA_URL);
    onApplyAndRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Cabeçalho do Modal */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B2A4A] text-[#F28C28] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Conexão Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Configuração do link da planilha publicada
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
          {/* Status atual */}
          {isDefaultPlaceholder ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Planilha de Demonstração ativa:</strong> O arquivo <code>src/config.ts</code> ainda está com o link padrão. O app está exibindo a base de teste (~65 cidades de SP).
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Link conectado:</strong> O app busca os dados diretamente do link CSV publicado.
              </div>
            </div>
          )}

          {/* Campo de URL */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#F28C28]" />
              Link CSV publicado da Planilha (Web):
            </label>
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv"
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0B2A4A] text-xs font-mono text-slate-800 outline-none transition"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dica: Você também pode editar diretamente a constante <code>DATA_URL</code> no arquivo <code>src/config.ts</code>.
            </span>
          </div>

          {/* Passo a Passo Rápido */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
              Como gerar o link no Google Sheets:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Abra sua planilha no Google Drive.</li>
              <li>Acesse <strong>Arquivo &gt; Compartilhar &gt; Publicar na Web</strong>.</li>
              <li>Escolha a aba e selecione o formato <strong>Valores separados por vírgula (.csv)</strong>.</li>
              <li>Clique em <strong>Publicar</strong> e copie o link.</li>
              <li>Cole no campo acima ou em <code>src/config.ts</code>.</li>
            </ol>
          </div>

          {/* Colunas esperadas */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950">
            <span className="font-bold text-xs block mb-1">
              Colunas obrigatórias da planilha (ordem exata):
            </span>
            <div className="font-mono text-[11px] bg-white p-2 rounded border border-blue-200 break-all select-all">
              Regiao, Praca, Cidade, Filial, Data_Carregamento, Observacao
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleResetToConfig}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0B2A4A] text-white hover:bg-[#071d33] transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Salvo!
                </>
              ) : (
                'Salvar e Atualizar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
