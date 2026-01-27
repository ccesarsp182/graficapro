
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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day).toLocaleDateString('pt-BR');
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
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Cliente / Contato</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Material / Obs.</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Financeiro</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{order.clientName}</p>
                          <button 
                            onClick={() => copyToClipboard(order)}
                            className={`p-1 rounded-md transition-all ${copiedId === order.id ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                            title="Copiar número de contato"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{formatDisplayDate(order.date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{order.materialType}</p>
                        <p className="text-[10px] text-slate-400 italic mb-1">{order.measurements || 'Medida não inf.'} • {order.quantity} un.</p>
                        {order.additionalInfo && (
                          <p className="text-[9px] text-indigo-500 dark:text-indigo-400 font-medium truncate max-w-[200px]" title={order.additionalInfo}>
                            Obs: {order.additionalInfo}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          {getDesignerName(order.designerId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(order.remainingValue)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">PAGO {formatCurrency(order.entryValue)}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-none outline-none cursor-pointer shadow-sm ${getStatusClasses(order.status)}`}
                        >
                          {Object.values(OrderStatus).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.attachments && order.attachments.length > 0 && (
                            <button 
                              onClick={() => setViewingAttachments(order.attachments!)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                              title="Ver artes"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            </button>
                          )}
                          <button 
                            onClick={() => onEdit(order)} 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                          {activeTab === 'active' ? (
                            <button 
                              onClick={() => onArchive(order.id)} 
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Arquivar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            </button>
                          ) : (
                            <button 
                              onClick={() => onRestore(order.id)} 
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Restaurar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                          )}
                          <button 
                            onClick={() => { if(window.confirm('Excluir permanentemente?')) onDelete(order.id); }} 
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col">
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${getStatusClasses(order.status)}`}>
                    {order.status}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{formatDisplayDate(order.date)}</p>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{order.clientName}</h3>
                  </div>

                  <div className="space-y-3 mb-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{order.materialType}</p>
                        <p className="text-[10px] text-slate-400">{order.measurements || 'S/ medida'} • {order.quantity} un.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{getDesignerName(order.designerId)}</p>
                    </div>

                    {order.additionalInfo && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Informações Adicionais</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight italic line-clamp-3">{order.additionalInfo}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Restante</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(order.remainingValue)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => copyToClipboard(order)} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${copiedId === order.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                        title="Copiar WhatsApp"
                      >
                        {copiedId === order.id ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-scaleIn" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            Contato
                          </>
                        )}
                      </button>
                      <button onClick={() => onEdit(order)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2M4 13H2a2 2 0 00-2 2v7a2 2 0 002 2h2m0-9V6a2 2 0 012-2h2m0 9V6a2 2 0 012-2"></path></svg>
            </div>
            <p className="text-slate-500 font-medium">Nenhum pedido encontrado nesta visualização.</p>
            {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 font-bold hover:underline text-xs">Limpar busca</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
