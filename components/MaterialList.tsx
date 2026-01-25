
import React, { useState } from 'react';
import { Material } from '../types';

interface MaterialListProps {
  materials: Material[];
  onSave: (material: Material) => void;
  onDelete: (id: string) => void;
}

const MaterialList: React.FC<MaterialListProps> = ({ materials, onSave, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<Partial<Material>>({ name: '', basePrice: 0, unit: 'un', category: 'Geral' });

  const resetForm = () => {
    setForm({ name: '', basePrice: 0, unit: 'un', category: 'Geral' });
    setEditingMaterial(null);
    setShowForm(false);
  };

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setForm(material);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name) return;

    const item: Material = { 
      ...form as Material, 
      id: editingMaterial?.id || Math.random().toString(36).substr(2, 9), 
      category: form.category || 'Geral' 
    };
    
    onSave(item);
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white transition-colors">Materiais</h2>
          <p className="text-slate-500 text-sm">Gerencie o catálogo de itens da sua gráfica.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setLayoutMode('list')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title="Visualização em Lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <button 
              onClick={() => setLayoutMode('grid')}
              className={`p-2 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              title="Visualização em Grade"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
          </div>

          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Novo Material
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 shadow-xl animate-slideDown">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
            {editingMaterial ? 'Editar Material' : 'Cadastrar Novo Material'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Nome do Material</label>
              <input 
                placeholder="Ex: Banner de Lona" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Preço Base (R$)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all" 
                value={form.basePrice}
                onChange={e => setForm({...form, basePrice: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Unidade</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all" 
                value={form.unit}
                onChange={e => setForm({...form, unit: e.target.value})}
              >
                <option value="un">Unidade</option>
                <option value="m2">M²</option>
                <option value="cento">Cento</option>
                <option value="milhar">Milhar</option>
                <option value="folha">Folha</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancelar</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              {editingMaterial ? 'Atualizar Material' : 'Salvar Material'}
            </button>
          </div>
        </div>
      )}

      {materials.length > 0 ? (
        layoutMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {materials.map(m => (
              <div key={m.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Excluir material?')) onDelete(m.id); }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{m.name}</h3>
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">{m.category}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-400">R$</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{m.basePrice.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">/ {m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fadeIn transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/20">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Material</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {materials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{m.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{formatCurrency(m.basePrice)} / {m.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(m)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                          <button onClick={() => { if(window.confirm('Excluir?')) onDelete(m.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-medium">Nenhum material cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-indigo-600 font-bold hover:underline text-sm">Cadastrar agora →</button>
        </div>
      )}
    </div>
  );
};

export default MaterialList;
