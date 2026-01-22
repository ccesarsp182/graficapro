
import React, { useState } from 'react';
import { Designer } from '../types';

interface DesignerListProps {
  designers: Designer[];
  setDesigners: React.Dispatch<React.SetStateAction<Designer[]>>;
}

const DesignerList: React.FC<DesignerListProps> = ({ designers, setDesigners }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Designer>>({ name: '', specialty: '', status: 'Ativo' });

  const handleAdd = () => {
    if(!form.name) return;
    const item: Designer = { ...form as Designer, id: Math.random().toString(36).substr(2, 9), email: '' };
    setDesigners([item, ...designers]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Designers Gráficos</h2>
          <p className="text-slate-500 text-sm">Gerencie sua equipe criativa.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold">+ Novo Designer</button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nome" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Especialidade (ex: Logos, Banners)" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" onChange={e => setForm({...form, specialty: e.target.value})} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Salvar</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {designers.map(d => (
          <div key={d.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {d.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold dark:text-white">{d.name}</h3>
              <p className="text-xs text-slate-500">{d.specialty}</p>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${d.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignerList;
