
import React, { useState } from 'react';
import { Budget, BudgetStatus } from '../types';

interface BudgetListProps {
  budgets: Budget[];
  onSave: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onConvertToOrder: (budget: Budget) => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, onSave, onDelete, onConvertToOrder }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState<Partial<Budget>>({
    clientName: '',
    email: '',
    phone: '',
    materialType: '',
    measurements: '',
    quantity: 1,
    totalValue: 0,
    deliveryDeadline: '',
    validUntil: '',
    notes: '',
    status: BudgetStatus.WAITING
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.materialType || !formData.totalValue) {
      alert('Por favor, preencha os campos obrigatórios (Cliente, Material e Valor).');
      return;
    }

    const budget: Budget = {
      ...formData as Budget,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      status: BudgetStatus.WAITING
    };

    onSave(budget);
    setShowAdd(false);
    setFormData({
      clientName: '',
      email: '',
      phone: '',
      materialType: '',
      measurements: '',
      quantity: 1,
      totalValue: 0,
      deliveryDeadline: '',
      validUntil: '',
      notes: '',
      status: BudgetStatus.WAITING
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função para formatar data sem deslocamento de UTC
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day).toLocaleDateString('pt-BR');
  };

  const sendWhatsApp = (b: Budget) => {
    const cleanPhone = b.phone.replace(/\D/g, '');
    const message = `Olá *${b.clientName}*! Segue o seu orçamento da *GráficaPro*:%0A%0A` +
      `*Material:* ${b.materialType}%0A` +
      (b.measurements ? `*Medida:* ${b.measurements}%0A` : '') +
      `*Quantidade:* ${b.quantity}%0A` +
      `*Valor Total:* ${formatCurrency(b.totalValue)}%0A` +
      (b.deliveryDeadline ? `*Prazo de Entrega:* ${b.deliveryDeadline}%0A` : '') +
      (b.validUntil ? `*Válido até:* ${formatDisplayDate(b.validUntil)}%0A` : '') +
      (b.notes ? `%0A*Obs:* ${b.notes}%0A` : '') +
      `%0AFicamos no aguardo da sua aprovação!`;

    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all";
  const labelClass = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wide";

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white transition-colors">Orçamentos</h2>
          <p className="text-slate-500 text-sm">Gerencie propostas comerciais e converta-as em pedidos.</p>
        </div>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Novo Orçamento
          </button>
        )}
      </header>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 shadow-xl animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Cliente *</label>
              <input 
                className={inputClass} 
                value={formData.clientName} 
                onChange={e => setFormData({...formData, clientName: e.target.value})} 
                placeholder="Nome do cliente ou empresa"
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input 
                type="email"
                className={inputClass} 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input 
                className={inputClass} 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Material *</label>
              <input 
                className={inputClass} 
                value={formData.materialType} 
                onChange={e => setFormData({...formData, materialType: e.target.value})} 
                placeholder="Ex: Cartão de Visita, Folder..."
              />
            </div>
            <div>
              <label className={labelClass}>Medida</label>
              <input 
                className={inputClass} 
                value={formData.measurements} 
                onChange={e => setFormData({...formData, measurements: e.target.value})} 
                placeholder="Ex: 9x5cm"
              />
            </div>
            <div>
              <label className={labelClass}>Quantidade</label>
              <input 
                type="number"
                className={inputClass} 
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
              />
            </div>
            <div>
              <label className={labelClass}>Valor Total (R$) *</label>
              <input 
                type="number"
                step="0.01"
                className={inputClass} 
                value={formData.totalValue} 
                onChange={e => setFormData({...formData, totalValue: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div>
              <label className={labelClass}>Prazo de Entrega</label>
              <input 
                className={inputClass} 
                value={formData.deliveryDeadline} 
                onChange={e => setFormData({...formData, deliveryDeadline: e.target.value})} 
                placeholder="Ex: 3 dias úteis"
              />
            </div>
            <div>
              <label className={labelClass}>Validade do Orçamento</label>
              <input 
                type="date"
                className={inputClass} 
                value={formData.validUntil} 
                onChange={e => setFormData({...formData, validUntil: e.target.value})} 
              />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Informações Adicionais</label>
              <textarea 
                className={`${inputClass} min-h-[80px]`} 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                placeholder="Detalhes extras, acabamentos, tipo de papel..."
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancelar</button>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Salvar Orçamento</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {budgets.length > 0 ? budgets.map(b => (
          <div key={b.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="font-bold text-lg text-slate-800 dark:text-white">{b.clientName}</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  b.status === BudgetStatus.WAITING ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' : 
                  b.status === BudgetStatus.APPROVED ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 
                  'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                }`}>{b.status}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  {b.materialType}
                </span>
                {b.measurements && <span className="flex items-center gap-1 italic">[{b.measurements}]</span>}
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(b.totalValue)}</span>
                {b.deliveryDeadline && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Prazo: {b.deliveryDeadline}
                  </span>
                )}
              </div>
              {b.phone && <p className="text-[10px] text-slate-400 mt-1">Tel: {b.phone}</p>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Validade</p>
                <p className="text-xs font-medium dark:text-slate-300">{formatDisplayDate(b.validUntil)}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => sendWhatsApp(b)} 
                  className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all group/wa"
                  title="Enviar via WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </button>

                {b.status === BudgetStatus.WAITING && (
                  <button 
                    onClick={() => onConvertToOrder(b)} 
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-2"
                    title="Converter em Pedido"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Gerar Pedido
                  </button>
                )}

                <button 
                  onClick={() => {
                    if(window.confirm('Excluir este orçamento?')) onDelete(b.id);
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Excluir Orçamento"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p className="text-slate-500 font-medium">Nenhum orçamento cadastrado.</p>
            <button onClick={() => setShowAdd(true)} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm">Criar meu primeiro orçamento →</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;
