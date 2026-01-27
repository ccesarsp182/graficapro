
import React from 'react';
import { DashboardStats, Order, OrderStatus } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  orders: Order[];
  onViewAll: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, orders, onViewAll }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função segura para formatar data local
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day).toLocaleDateString('pt-BR');
  };

  const statCards = [
    { label: 'Pedidos Ativos', value: stats.totalOrders, color: 'indigo', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> },
    { label: 'Pendentes', value: stats.pendingCount, color: 'amber', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { label: 'Em Processo', value: stats.inProcessCount, color: 'blue', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> },
    { label: 'Orçamentos', value: stats.pendingBudgets, color: 'emerald', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Visão Geral</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe o desempenho da sua gráfica em tempo real.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-default group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              stat.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
              stat.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
              stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
              'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Próximas Entregas</h3>
            <button onClick={onViewAll} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Ver todos</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-50 dark:border-slate-800">
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Cliente</th>
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Trabalho</th>
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Restante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <td className="py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{order.clientName}</p>
                      <p className="text-xs text-slate-400">{formatDisplayDate(order.date)}</p>
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{order.materialType}</td>
                    <td className="py-4 font-bold text-sm text-slate-800 dark:text-slate-200">{formatCurrency(order.remainingValue)}</td>
                  </tr>
                )) : <tr><td colSpan={3} className="py-8 text-center text-slate-400 italic">Nenhum pedido recente.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-80">Saldo Financeiro</h3>
            <p className="text-4xl font-black mt-2 tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-indigo-500/50 pb-2">
                <span className="opacity-80">Recebido</span>
                <span className="font-bold">{formatCurrency(orders.reduce((acc, curr) => acc + curr.entryValue, 0))}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-indigo-500/50 pb-2">
                <span className="opacity-80">A Receber</span>
                <span className="font-bold">{formatCurrency(orders.reduce((acc, curr) => acc + curr.remainingValue, 0))}</span>
              </div>
            </div>
          </div>
          <button onClick={onViewAll} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black mt-8 hover:bg-indigo-50 hover:shadow-lg transition-all active:scale-95 relative z-10">Relatório Completo</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
