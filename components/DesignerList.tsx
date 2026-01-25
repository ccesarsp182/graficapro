
import React, { useState } from 'react';
import { Designer } from '../types';

interface DesignerListProps {
  designers: Designer[];
  onSave: (designer: Designer) => void;
  onDelete: (id: string) => void;
}

const DesignerList: React.FC<DesignerListProps> = ({ designers, onSave, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Designer>>({ name: '', specialty: '', status: 'Ativo' });

  const handleAdd = () => {
    if(!form.name) return;
    const item: Designer = { 
      ...form as Designer, 
      id: Math.random().toString(36).substr(2, 9), 
      email: form.email || '' 
    };
    onSave(item);
    setShowAdd(false);
    setForm({ name: '', specialty: '', status: 'Ativo' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Designers Gráficos</h2>
          <p className="text-slate-500 text-sm">Gerencie sua equipe criativa.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Novo Designer</button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 animate-slideDown shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nome" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Especialidade (ex: Logos, Banners)" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all">Salvar</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {designers.length > 0 ? designers.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {d.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold dark:text-white">{d.name}</h3>
              <p className="text-xs text-slate-500">{d.specialty}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${d.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{d.status}</span>
              <button onClick={() => { if(window.confirm('Remover designer?')) onDelete(d.id); }} className="text-slate-300 hover:text-rose-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        )) : (
          <p className="text-center py-10 text-slate-400 italic">Nenhum designer na equipe ainda.</p>
        )}
      </div>
    </div>
  );
};

export default DesignerList;
