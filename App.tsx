
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, Budget, Material, Designer, User } from './types';
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('graficapro_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
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

  // Carregar dados específicos do usuário logado
  useEffect(() => {
    if (currentUser) {
      const load = (key: string, setter: any) => {
        const saved = localStorage.getItem(`user_${currentUser.id}_${key}`);
        setter(saved ? JSON.parse(saved) : []);
      };
      load('orders', setOrders);
      load('budgets', setBudgets);
      load('materials', setMaterials);
      load('designers', setDesigners);
    } else {
      setOrders([]);
      setBudgets([]);
      setMaterials([]);
      setDesigners([]);
    }
  }, [currentUser]);

  // Sincronizar dados específicos do usuário
  useEffect(() => { 
    if (currentUser) localStorage.setItem(`user_${currentUser.id}_orders`, JSON.stringify(orders)); 
  }, [orders, currentUser]);
  
  useEffect(() => { 
    if (currentUser) localStorage.setItem(`user_${currentUser.id}_budgets`, JSON.stringify(budgets)); 
  }, [budgets, currentUser]);
  
  useEffect(() => { 
    if (currentUser) localStorage.setItem(`user_${currentUser.id}_materials`, JSON.stringify(materials)); 
  }, [materials, currentUser]);
  
  useEffect(() => { 
    if (currentUser) localStorage.setItem(`user_${currentUser.id}_designers`, JSON.stringify(designers)); 
  }, [designers, currentUser]);

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('graficapro_current_user', JSON.stringify(user));
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('graficapro_current_user');
  };

  if (!currentUser) {
    return <LandingPage onAuthSuccess={handleLogin} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />;
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
              onDelete={id => setOrders(prev => prev.filter(o => o.id !== id))} 
              onEdit={order => { setEditingOrder(order); setView('add'); }} 
              onUpdateStatus={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o))}
              onArchive={id => setOrders(prev => prev.map(o => o.id === id ? { ...o, archived: true } : o))}
              onRestore={id => setOrders(prev => prev.map(o => o.id === id ? { ...o, archived: false } : o))}
              onArchiveAllDelivered={() => {
                const count = activeOrders.filter(o => o.status === OrderStatus.DELIVERED).length;
                if (count > 0 && window.confirm(`Deseja arquivar todos os ${count} pedidos entregues?`)) {
                  setOrders(prev => prev.map(o => (o.status === OrderStatus.DELIVERED && !o.archived) ? { ...o, archived: true } : o));
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
                if (editingOrder) setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
                else setOrders(prev => [updated, ...prev]);
                setEditingOrder(null);
                setView('list');
              }} 
              initialData={editingOrder}
              onCancel={() => { setEditingOrder(null); setView('list'); }}
            />
          )}
          {view === 'budgets' && (
            <BudgetList 
              budgets={budgets} 
              setBudgets={setBudgets} 
              onConvertToOrder={(b) => {
                const newOrder: Order = { 
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString().split('T')[0],
                  clientName: b.clientName,
                  phone: b.phone,
                  materialType: b.materialType,
                  measurements: b.measurements,
                  quantity: b.quantity,
                  color: '',
                  additionalInfo: `${b.notes || ''}\nEmail: ${b.email || 'N/A'}`,
                  entryValue: 0,
                  remainingValue: b.totalValue,
                  status: OrderStatus.PENDING,
                  archived: false
                };
                setOrders(prev => [newOrder, ...prev]);
                setBudgets(prev => prev.map(item => item.id === b.id ? {...item, status: 'Aprovado' as any} : item));
                setView('list');
              }}
            />
          )}
          {view === 'materials' && <MaterialList materials={materials} setMaterials={setMaterials} />}
          {view === 'designers' && <DesignerList designers={designers} setDesigners={setDesigners} />}
          {view === 'financial' && <FinancialControl orders={orders} />}
        </div>
      </main>
    </div>
  );
};

export default App;
