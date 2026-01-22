
import React, { useState } from 'react';
import { Order, OrderStatus, Attachment, Designer } from '../types';

interface OrderListProps {
  orders: Order[];
  designers: Designer[];
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onArchiveAllDelivered: () => void;
  onAddNew: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  designers,
  onDelete, 
  onEdit, 
  onUpdateStatus, 
  onArchive,
  onRestore,
  onArchiveAllDelivered,
  onAddNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Todos'>('Todos');
  const [layoutMode, setLayoutMode] = useState<'table' | 'grid'>('table');
  const [viewingAttachments, setViewingAttachments] = useState<Attachment[] | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesArchived = activeTab === 'active' ? !order.archived : order.archived;
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.materialType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    return matchesArchived && matchesSearch && matchesStatus;
  });

  const deliveredCount = orders.filter(o => o.status === OrderStatus.DELIVERED && !o.archived).length;
  const archivedCount = orders.filter(o => o.archived).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const copyToClipboard = (order: Order) => {
    navigator.clipboard.writeText(order.phone).then(() => {
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDownload = (file: Attachment) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDesignerName = (id?: string) => {
    if (!id) return 'Sem responsável';
    const designer = designers.find(d => d.id === id);
    return designer ? designer.name : 'Desconhecido';
  };

  const getStatusClasses = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
      case OrderStatus.IN_PROCESS:
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
      case OrderStatus.DELIVERED:
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Modal de Anexos */}
      {viewingAttachments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                Arquivos de Arte
              </h3>
              <button onClick={() => setViewingAttachments(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {viewingAttachments.length > 0 ? viewingAttachments.map((file, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-inner">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"></path></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{file.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">{file.type || 'Arquivo'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(file)}
                      className="text-white bg-indigo-600 hover:bg-indigo-700 transition-all p-2.5 rounded-xl shadow-md" 
                      title="Baixar Arquivo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    </button>
                  </div>
                  {file.type.startsWith('image/') && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                      <img src={file.data} className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform" alt={file.name} onClick={() => window.open(file.data, '_blank')} />
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-center text-slate-500 py-4 italic">Nenhum arquivo encontrado.</p>
              )}
            </div>
            <button onClick={() => setViewingAttachments(null)} className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Fechar</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${activeTab === 'active' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {activeTab === 'active' ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
              {activeTab === 'active' ? 'Fluxo de Produção' : 'Histórico Arquivado'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {activeTab === 'active' 
                ? 'Pedidos em andamento e novas demandas.' 
                : `Total de ${archivedCount} pedidos finalizados e guardados.`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {activeTab === 'active' && deliveredCount > 0 && (
            <button 
              onClick={onArchiveAllDelivered}
              className="px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              title="Limpar pedidos entregues"
            >
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Arquivar Entregues ({deliveredCount})
            </button>
          )}
          {activeTab === 'active' && (
            <button 
              onClick={onAddNew}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Pedido
            </button>
          )}
        </div>
      </header>

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          ATIVOS
        </button>
        <button 
          onClick={() => setActiveTab('archived')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'archived' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          ARQUIVADOS
          {archivedCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'archived' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              {archivedCount}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input
                type="text"
                placeholder="Buscar cliente ou material..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none dark:text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {['Todos', ...Object.values(OrderStatus)].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === status 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setLayoutMode('table')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title="Lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <button 
              onClick={() => setLayoutMode('grid')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title="Grade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          layoutMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/20">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Cliente / Data</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Material / Detalhes</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Financeiro</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${order.archived ? 'opacity-80' : ''}`}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{order.clientName}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => copyToClipboard(order)}
                            className={`text-xs font-bold flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md ${copiedId === order.id ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title="Copiar número de contato"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                            {copiedId === order.id ? 'Copiado!' : order.phone}
                          </button>
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{order.materialType}</span>
                            {(order.attachments?.length || 0) > 0 && (
                                <button 
                                  onClick={() => setViewingAttachments(order.attachments || [])}
                                  className="text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1 rounded transition-colors" 
                                  title={`Ver ${order.attachments?.length} anexo(s)`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                </button>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {order.measurements} | {order.quantity} un | {order.color}
                        </div>
                        {order.additionalInfo && (
                          <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 italic truncate max-w-[200px]" title={order.additionalInfo}>
                             Obs: {order.additionalInfo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {getDesignerName(order.designerId).charAt(0)}
                           </div>
                           <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {getDesignerName(order.designerId)}
                           </div>
                        </div>
                        <div className="mt-2">
                          <select
                            disabled={order.archived}
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-bold py-1 px-3 rounded-full border-none focus:ring-0 cursor-pointer ${getStatusClasses(order.status)} ${order.archived ? 'cursor-default opacity-80' : ''}`}
                          >
                            {Object.values(OrderStatus).map(status => (
                              <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="text-xs text-slate-400 dark:text-slate-500">Total: {formatCurrency(order.entryValue + order.remainingValue)}</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          Restante: <span className={order.remainingValue > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                            {formatCurrency(order.remainingValue)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {order.archived ? (
                            <button 
                              onClick={() => onRestore(order.id)}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                              title="Restaurar do Arquivo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                            </button>
                          ) : (
                            <>
                              {order.status === OrderStatus.DELIVERED && (
                                <button 
                                  onClick={() => onArchive(order.id)}
                                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                                  title="Arquivar Pedido"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                </button>
                              )}
                              <button 
                                onClick={() => onEdit(order)}
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                title="Editar"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => onDelete(order.id)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/30 dark:bg-slate-800/20">
              {filteredOrders.map((order) => (
                <div key={order.id} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group ${order.archived ? 'grayscale-[0.3]' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{order.clientName}</h3>
                        <button 
                          onClick={() => copyToClipboard(order)}
                          className={`p-1.5 transition-all rounded-lg ${copiedId === order.id ? 'bg-emerald-100 text-emerald-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                          title="Copiar contato"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{order.materialType}</p>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase tracking-tighter">
                          {getDesignerName(order.designerId)}
                        </span>
                      </div>
                    </div>
                    <select
                      disabled={order.archived}
                      value={order.status}
                      onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-full border-none focus:ring-0 cursor-pointer ${getStatusClasses(order.status)} ${order.archived ? 'cursor-default opacity-80' : ''}`}
                    >
                      {Object.values(OrderStatus).map(status => (
                        <option key={status} value={status} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Especificações</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{order.measurements} | {order.quantity} un</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{order.color}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Registro</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                      <div className="flex justify-end items-center gap-2 mt-1">
                        <span className={`text-xs font-medium transition-all ${copiedId === order.id ? 'text-emerald-600 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {copiedId === order.id ? 'Número Copiado!' : order.phone}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(order)}
                          className={`p-1 rounded-md transition-all ${copiedId === order.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                          title="Copiar número"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {order.additionalInfo && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 shadow-inner">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">Informações Adicionais</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                        "{order.additionalInfo}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex gap-2">
                      {(order.attachments?.length || 0) > 0 && (
                        <button 
                          onClick={() => setViewingAttachments(order.attachments || [])}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                        >
                          ARQUIVOS ({order.attachments?.length})
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Pendente</p>
                      <p className={`text-sm font-bold ${order.remainingValue > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(order.remainingValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {order.archived ? (
                      <button 
                        onClick={() => onRestore(order.id)}
                        className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        title="Restaurar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                      </button>
                    ) : (
                      <>
                        {order.status === OrderStatus.DELIVERED && (
                          <button 
                            onClick={() => onArchive(order.id)}
                            className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                            title="Arquivar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                          </button>
                        )}
                        <button 
                          onClick={() => onEdit(order)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => onDelete(order.id)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
              {activeTab === 'active' ? (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {activeTab === 'active' ? 'Nenhum pedido ativo' : 'O arquivo está vazio'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              {activeTab === 'active' 
                ? 'Tudo limpo por aqui! Quando você criar novos pedidos, eles aparecerão nesta lista.' 
                : 'Históricos de pedidos finalizados e arquivados ficarão guardados nesta área.'}
            </p>
            {activeTab === 'active' && (
              <button 
                onClick={onAddNew}
                className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Criar seu primeiro pedido agora →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
