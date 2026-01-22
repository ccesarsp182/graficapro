
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, Designer, Material, Attachment } from '../types';

interface OrderFormProps {
  onSave: (order: Order) => void;
  onCancel: () => void;
  initialData?: Order | null;
  designers: Designer[];
  materials: Material[];
}

const OrderForm: React.FC<OrderFormProps> = ({ onSave, onCancel, initialData, designers, materials }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const materialSelectorRef = useRef<HTMLDivElement>(null);
  
  const [showMaterialDrawer, setShowMaterialDrawer] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Order>>({
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    phone: '',
    materialType: '',
    measurements: '',
    quantity: 1,
    color: '',
    additionalInfo: '',
    entryValue: 0,
    remainingValue: 0,
    status: OrderStatus.PENDING,
    designerId: '',
    attachments: []
  });

  useEffect(() => {
    if (initialData) setFormData({
        ...initialData,
        attachments: initialData.attachments || []
    });
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (materialSelectorRef.current && !materialSelectorRef.current.contains(event.target as Node)) {
        setShowMaterialDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.materialType) return alert('Campos obrigatórios: Nome e Material');
    
    onSave({
      ...formData as Order,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      entryValue: Number(formData.entryValue),
      remainingValue: Number(formData.remainingValue)
    });
  };

  // Fixed type inference by explicitly casting files and handling file properties
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files) as File[];
      
      const newAttachments: Attachment[] = await Promise.all(
        files.map(file => {
          return new Promise<Attachment>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                name: file.name,
                type: file.type,
                data: event.target?.result as string
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      }));
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 tracking-wide";

  return (
    <div className="animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-bold dark:text-white transition-colors">
            {initialData ? 'Editar Pedido' : 'Novo Pedido'}
        </h2>
        <p className="text-slate-500 mt-1">Configure todos os detalhes da produção e anexe arquivos de arte.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all shadow-sm">
        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs">01</span>
            Cliente e Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Cliente *</label>
              <input className={inputClass} value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} placeholder="Nome completo ou empresa" />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={labelClass}>Data do Pedido</label>
              <input type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs">02</span>
            Especificações Técnicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 relative" ref={materialSelectorRef}>
              <label className={labelClass}>Material *</label>
              <div className="relative">
                <input 
                  className={`${inputClass} pr-10`} 
                  value={formData.materialType} 
                  onChange={e => {
                    setFormData({...formData, materialType: e.target.value});
                    setMaterialSearch(e.target.value);
                  }} 
                  onFocus={() => setShowMaterialDrawer(true)}
                  placeholder="Banner, Cartão, Folder..." 
                />
                <button 
                  type="button"
                  onClick={() => setShowMaterialDrawer(!showMaterialDrawer)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <svg className={`w-5 h-5 transition-transform ${showMaterialDrawer ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>

              {showMaterialDrawer && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slideDown max-h-64 overflow-y-auto custom-scrollbar">
                  <div className="p-2 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Materiais Cadastrados</p>
                  </div>
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, materialType: m.name});
                          setShowMaterialDrawer(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{m.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{m.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">R$ {m.basePrice.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400">/{m.unit}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500 italic">Nenhum material encontrado</p>
                    </div>
                  )}
                  <div className="p-2 border-t border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                     <p className="text-[10px] text-slate-400 text-center">Você também pode digitar um material não cadastrado.</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Medida</label>
              <input className={inputClass} value={formData.measurements} onChange={e => setFormData({...formData, measurements: e.target.value})} placeholder="Ex: 10x15cm" />
            </div>
            <div>
              <label className={labelClass}>Quantidade</label>
              <input type="number" className={inputClass} value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className={labelClass}>Cores</label>
              <input className={inputClass} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="Ex: 4x0, 4x4" />
            </div>
          </div>
          <div className="mt-6">
              <label className={labelClass}>Informações Adicionais</label>
              <textarea 
                className={`${inputClass} min-h-[100px] resize-none py-4`} 
                value={formData.additionalInfo} 
                onChange={e => setFormData({...formData, additionalInfo: e.target.value})}
                placeholder="Detalhes sobre cores, acabamentos, prazos ou observações especiais..."
              />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs">03</span>
            Arquivos e Responsáveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Designer Responsável</label>
              <select className={inputClass} value={formData.designerId} onChange={e => setFormData({...formData, designerId: e.target.value})}>
                <option value="">Nenhum selecionado</option>
                {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Arquivos de Arte</label>
              <div className="flex flex-wrap gap-3 items-center">
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <button 
                    type="button" 
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all text-sm font-medium ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        Anexar Arquivos
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap gap-2">
                    {formData.attachments?.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                            {file.type.startsWith('image/') && (
                              <img src={file.data} className="w-5 h-5 rounded object-cover" alt="" />
                            )}
                            <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-rose-500 hover:text-rose-700 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    ))}
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">* Arquivos ficam salvos localmente no seu navegador.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-xs">04</span>
            Financeiro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Valor Entrada</label>
              <div className="relative">
                <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 font-medium">R$</span>
                <input type="number" step="0.01" className={`${inputClass} pl-10`} value={formData.entryValue} onChange={e => setFormData({...formData, entryValue: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Valor Restante</label>
              <div className="relative">
                <span className="absolute left-3 inset-y-0 flex items-center text-slate-400 font-medium">R$</span>
                <input type="number" step="0.01" className={`${inputClass} pl-10`} value={formData.remainingValue} onChange={e => setFormData({...formData, remainingValue: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancelar</button>
          <button type="submit" disabled={isUploading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">Salvar Pedido</button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
