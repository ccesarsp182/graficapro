
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Budget, Material, Designer, User } from './types';
import { supabase } from './supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import BudgetList from './components/BudgetList';
import MaterialList from './components/MaterialList';
import DesignerList from './components/DesignerList';
import FinancialControl from './components/FinancialControl';
import LandingPage from './components/LandingPage';

type View = 'dashboard' | 'list' | 'add' | 'budgets' | 'materials' | 'designers' | 'financial';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  
  const [view, setView] = useState<View>('dashboard');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('graficapro_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata.name || 'Usuário',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata.name || 'Usuário',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url
        });
      } else {
        setCurrentUser(null);
        setOrders([]);
        setBudgets([]);
        setMaterials([]);
        setDesigners([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        const uid = currentUser.id;
        try {
          const [oRes, bRes, mRes, dRes] = await Promise.all([
            supabase.from('orders').select('*').eq('user_id', uid).order('date', { ascending: false }),
            supabase.from('budgets').select('*').eq('user_id', uid).order('date', { ascending: false }),
            supabase.from('materials').select('*').eq('user_id', uid).order('name', { ascending: true }),
            supabase.from('designers').select('*').eq('user_id', uid).order('name', { ascending: true })
          ]);

          if (oRes.error) throw oRes.error;
          if (bRes.error) throw bRes.error;
          if (mRes.error) throw mRes.error;
          if (dRes.error) throw dRes.error;

          setOrders(oRes.data || []);
          setBudgets(bRes.data || []);
          setMaterials(mRes.data || []);
          setDesigners(dRes.data || []);
        } catch (err: any) {
          console.error("Erro ao buscar dados:", err);
          if (err.code === '42P01') {
            alert("Atenção: As tabelas do banco de dados ainda não foram criadas no Supabase. Execute o script SQL de configuração.");
          } else if (err.code === '42501') {
            alert("Erro de permissão: RLS bloqueou o acesso. Verifique se as políticas de segurança foram criadas no Supabase.");
          }
        }
      };
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('graficapro_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const activeOrders = useMemo(() => orders.filter(o => !o.archived), [orders]);

  const stats = useMemo(() => ({
    totalOrders: activeOrders.length,
    pendingCount: activeOrders.filter(o => o.status === OrderStatus.PENDING).length,
    inProcessCount: activeOrders.filter(o => o.status === OrderStatus.IN_PROCESS).length,
    deliveredCount: activeOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
    totalRevenue: activeOrders.reduce((acc, curr) => acc + curr.entryValue + curr.remainingValue, 0),
    pendingBudgets: budgets.filter(b => b.status === 'Aguardando').length
  }), [activeOrders, budgets]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const syncEntity = async (table: string, item: any, setState: Function, isDelete = false) => {
    if (!currentUser) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      return;
    }
    
    try {
      if (isDelete) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', item.id)
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        setState((prev: any[]) => prev.filter(i => i.id !== item.id));
      } else {
        const payload = { ...item, user_id: currentUser.id };
        const { error } = await supabase.from(table).upsert(payload);
        
        if (error) throw error;
        setState((prev: any[]) => {
          const exists = prev.find(i => i.id === item.id);
          return exists ? prev.map(i => i.id === item.id ? item : i) : [item, ...prev];
        });
      }
    } catch (err: any) {
      console.error(`Erro em ${table}:`, err);
      if (err.code === '42P01') {
        alert(`Erro crítico: Tabela '${table}' ausente. Execute o SQL de instalação.`);
      } else if (err.code === '42501') {
        alert("Ação negada: Você não tem permissão para alterar este registro (RLS Violado).");
      } else {
        alert(`Erro ao sincronizar: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 transition-colors"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!currentUser) {
    return <LandingPage onAuthSuccess={(user) => setCurrentUser(user)} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar 
        userName={currentUser.name}
        avatar={currentUser.avatar}
        currentView={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto pt-4">
          {view === 'dashboard' && <Dashboard stats={stats} orders={activeOrders.slice(0, 5)} onViewAll={() => setView('list')} />}
          
          {view === 'list' && (
            <OrderList 
              orders={orders} 
              designers={designers}
              onDelete={id => syncEntity('orders', { id }, setOrders, true)} 
              onEdit={order => { setEditingOrder(order); setView('add'); }} 
              onUpdateStatus={(id, s) => {
                const order = orders.find(o => o.id === id);
                if (order) syncEntity('orders', {...order, status: s}, setOrders);
              }}
              onArchive={id => {
                const order = order = orders.find(o => o.id === id);
                if (order) syncEntity('orders', {...order, archived: true}, setOrders);
              }}
              onRestore={id => {
                const order = orders.find(o => o.id === id);
                if (order) syncEntity('orders', {...order, archived: false}, setOrders);
              }}
              onArchiveAllDelivered={async () => {
                const delivered = orders.filter(o => o.status === OrderStatus.DELIVERED && !o.archived);
                if (delivered.length > 0 && window.confirm(`Deseja arquivar ${delivered.length} pedidos?`)) {
                  const updates = delivered.map(o => ({ ...o, archived: true, user_id: currentUser.id }));
                  const { error } = await supabase.from('orders').upsert(updates);
                  if (!error) {
                    setOrders(prev => prev.map(o => o.status === OrderStatus.DELIVERED ? {...o, archived: true} : o));
                  } else {
                    alert("Erro ao arquivar pedidos: " + error.message);
                  }
                }
              }}
              onAddNew={() => setView('add')}
            />
          )}

          {view === 'add' && (
            <OrderForm 
              designers={designers}
              materials={materials}
              onSave={updated => {
                syncEntity('orders', updated, setOrders);
                setEditingOrder(null);
                setView('list');
              }}
              onCancel={() => {
                setEditingOrder(null);
                setView('list');
              }}
              initialData={editingOrder}
            />
          )}

          {view === 'budgets' && (
            <BudgetList 
              budgets={budgets}
              onSave={b => syncEntity('budgets', b, setBudgets)}
              onDelete={id => syncEntity('budgets', { id }, setBudgets, true)}
              onConvertToOrder={b => {
                const newOrder: Order = {
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString().split('T')[0],
                  clientName: b.clientName,
                  phone: b.phone,
                  materialType: b.materialType,
                  measurements: b.measurements,
                  quantity: b.quantity,
                  color: '',
                  additionalInfo: b.notes,
                  entryValue: 0,
                  remainingValue: b.totalValue,
                  status: OrderStatus.PENDING,
                  attachments: []
                };
                setEditingOrder(newOrder);
                setView('add');
              }}
            />
          )}

          {view === 'materials' && (
            <MaterialList 
              materials={materials}
              onSave={m => syncEntity('materials', m, setMaterials)}
              onDelete={id => syncEntity('materials', { id }, setMaterials, true)}
            />
          )}

          {view === 'designers' && (
            <DesignerList 
              designers={designers}
              onSave={d => syncEntity('designers', d, setDesigners)}
              onDelete={id => syncEntity('designers', { id }, setDesigners, true)}
            />
          )}

          {view === 'financial' && <FinancialControl orders={orders} />}
        </div>
      </main>
    </div>
  );
};

// Fix for index.tsx: Module has no default export
export default App;
