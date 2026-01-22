
import React, { useState } from 'react';
import { Material } from '../types';

interface MaterialListProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, setMaterials }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Material>>({ name: '', basePrice: 0, unit: 'un' });

  const handleAdd = () => {
    if(!form.name) return;
    const item: Material = { ...form as Material, id: Math.random().toString(36).substr(2, 9), category: 'Geral' };
    setMaterials([item, ...materials]);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Materiais</h2>
          <p className="text-slate-500 text-sm">Configure os itens que sua gráfica produz.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold">+ Novo Material</button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Nome do Material" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" onChange={e => setForm({...form, name: e.target.value})} />
            <input type="number" placeholder="Preço Base" className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} />
            <select className="px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" onChange={e => setForm({...form, unit: e.target.value})}>
              <option value="un">Unidade</option>
              <option value="m2">M²</option>
              <option value="cento">Cento</option>
              <option value="milhar">Milhar</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Salvar</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(m => (
          <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">{m.name}</h3>
            <p className="text-sm text-slate-500 mt-1">Preço: R$ {m.basePrice.toFixed(2)} / {m.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialList;
