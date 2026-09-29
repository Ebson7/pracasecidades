import React from 'react';
import { Clock, Truck, CalendarCheck } from 'lucide-react';

interface OperationalNoticeProps {
  selectedFilial?: string;
}

export const OperationalNotice: React.FC<OperationalNoticeProps> = ({ selectedFilial }) => {
  const isSP = selectedFilial?.toLowerCase().includes('paulo');
  const isBC = selectedFilial?.toLowerCase().includes('borac');

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 rounded-2xl border-2 border-amber-300/90 shadow-sm p-4 text-slate-800 transition-all">
      {/* Cabeçalho de Destaque */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-[#F28C28] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          <Clock className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-[#0B2A4A] tracking-tight uppercase">
              Regra Operacional & Fechamento de Pedidos
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#F28C28] text-white px-2 py-0.5 rounded-full shadow-2xs">
              Atenção RCA
            </span>
          </div>
          <p className="text-xs text-amber-950/80 font-medium">
            Orientações obrigatórias para alinhamento de prazos com os clientes
          </p>
        </div>
      </div>

      {/* Grid com os 3 pontos destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        {/* Ponto 1: Dia da Praça = Dia que Carrega */}
        <div className="bg-white/95 p-3 rounded-xl border border-amber-200 shadow-2xs flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0B2A4A] shrink-0 mt-0.5">
            <Truck className="w-4 h-4 text-[#0B2A4A]" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-xs">
              Dia da Praça = Carregamento
            </span>
            <span className="text-slate-600 block mt-0.5 leading-snug">
              O dia informado na consulta é o <strong>dia em que a carga sai</strong> da filial.
            </span>
          </div>
        </div>

        {/* Ponto 2: Horários de Fechamento */}
        <div className="bg-white/95 p-3 rounded-xl border border-amber-200 shadow-2xs flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-[#F28C28]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-slate-900 block text-xs">
              Horário Limite de Fechamento
            </span>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                  isSP
                    ? 'bg-[#0B2A4A] text-white border-[#0B2A4A] shadow-xs ring-1 ring-[#F28C28]'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                SP: <strong>12:00</strong>
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                  isBC
                    ? 'bg-[#0B2A4A] text-white border-[#0B2A4A] shadow-xs ring-1 ring-[#F28C28]'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                BC: <strong>11:30</strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Envio de pedidos até o horário limite.
            </span>
          </div>
        </div>

        {/* Ponto 3: Entregas no Dia Seguinte */}
        <div className="bg-white/95 p-3 rounded-xl border border-amber-200 shadow-2xs flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-xs">
              Entregas aos Clientes
            </span>
            <span className="text-slate-600 block mt-0.5 leading-snug">
              Acontecem <strong>a partir do dia seguinte</strong> ao dia da praça carregada.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
