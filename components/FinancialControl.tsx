
import React, { useMemo } from 'react';
import { Order } from '../types';

interface FinancialControlProps {
  orders: Order[];
}

const FinancialControl: React.FC<FinancialControlProps> = ({ orders }) => {
  const financialStats = useMemo(() => {
    const total = orders.reduce((acc, o) => acc + o.entryValue + o.remainingValue, 0);
    const received = orders.reduce((acc, o) => acc + o.entryValue, 0);
    const toReceive = orders.reduce((acc, o) => acc + o.remainingValue, 0);
    
    const byMaterial: Record<string, number> = {};
    orders.forEach(o => {
      byMaterial[o.materialType] = (byMaterial[o.materialType] || 0) + (o.entryValue + o.remainingValue);
    });

    return { total, received, toReceive, byMaterial };
  }, [orders]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const percentageReceived = financialStats.total > 0 
    ? (financialStats.received / financialStats.total) * 100 
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Gestão Financeira</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visão clara do seu faturamento e liquidez.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Bruto</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white">{formatCurrency(financialStats.total)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Já Recebido</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(financialStats.received)}</p>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
             <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentageReceived}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">A Receber</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(financialStats.toReceive)}</p>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
             <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${100 - percentageReceived}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Receita por Material</h3>
          <div className="space-y-4">
            {(Object.entries(financialStats.byMaterial) as [string, number][]).sort((a,b) => b[1] - a[1]).map(([material, value]) => (
              <div key={material}>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{material}</span>
                  <span className="font-bold">{formatCurrency(value)}</span>
                </div>
                <div className="w-full bg-slate-50 dark:bg-slate-800 h-1.5 rounded-full">
                   <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(value / financialStats.total) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Últimas Cobranças</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {orders.slice(0, 10).map(o => (
              <div key={o.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{o.clientName}</p>
                  <p className="text-[10px] text-slate-400">{o.materialType}</p>
                </div>
                <div className="text-right">
                  {o.remainingValue === 0 ? (
                    <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 px-2 py-1 rounded-lg">QUITADO</span>
                  ) : (
                    <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/20 text-amber-600 px-2 py-1 rounded-lg">FALTA {formatCurrency(o.remainingValue)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialControl;
