
import React, { useState } from 'react';
import { User } from '../types';

interface LandingPageProps {
  onAuthSuccess: (user: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    // Simulação de delay de rede
    setTimeout(() => {
      const usersRaw = localStorage.getItem('graficapro_users');
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

      if (authMode === 'signup') {
        if (users.find(u => u.email === email)) {
          setError('Este e-mail já está cadastrado.');
          setIsAuthenticating(false);
          return;
        }
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          password,
          provider: 'email'
        };

        users.push(newUser);
        localStorage.setItem('graficapro_users', JSON.stringify(users));
        onAuthSuccess(newUser);
      } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('E-mail ou senha incorretos.');
          setIsAuthenticating(false);
        }
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setError('');
    setIsAuthenticating(true);

    // Simulando o Popup do Google Identity Services
    setTimeout(() => {
      const googleUser: User = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        name: 'Usuário Google',
        email: 'usuario.google@gmail.com',
        provider: 'google',
        avatar: 'https://lh3.googleusercontent.com/a/default-user'
      };

      const usersRaw = localStorage.getItem('graficapro_users');
      const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      // Se o usuário não existe no nosso "banco" local, adicionamos
      if (!users.find(u => u.email === googleUser.email)) {
        users.push(googleUser);
        localStorage.setItem('graficapro_users', JSON.stringify(users));
      }

      onAuthSuccess(googleUser);
    }, 1500);
  };

  const openModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-700 animate-fadeIn">
      {/* Modal de Autenticação */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white p-10 animate-scaleIn relative overflow-hidden">
            {isAuthenticating && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-600">Autenticando...</p>
              </div>
            )}

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.71l-1.99 1.99C8.38 20.35 10.6 21 13 21c4.97 0 9-4.03 9-9h3l-4-4zM5 16l4-4H6c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.71l1.99-1.99C15.62 3.65 13.4 3 11 3c-4.97 0-9 4.03-9 9H0l4 4z"/></svg>
              </div>
              <h3 className="text-2xl font-black tracking-tight">{authMode === 'signup' ? 'Criar Conta' : 'Boas-vindas'}</h3>
              <p className="text-slate-500 text-sm mt-1">{authMode === 'signup' ? 'Comece a gerenciar sua gráfica hoje.' : 'Entre com suas credenciais para acessar.'}</p>
            </div>

            <div className="space-y-3 mb-6">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700 shadow-sm active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {authMode === 'signup' ? 'Cadastrar com Google' : 'Entrar com Google'}
              </button>
              
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-[1px] bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ou use e-mail</span>
                <div className="flex-1 h-[1px] bg-slate-100"></div>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <input 
                    required 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                    placeholder="Sua Gráfica ou Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                <input 
                  required 
                  type="password" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-rose-500 text-xs font-bold text-center mt-2">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-4"
              >
                {authMode === 'signup' ? 'Criar Minha Conta' : 'Entrar no Sistema'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {authMode === 'login' ? 'Ainda não tem conta? Cadastre-se grátis' : 'Já possui conta? Faça seu login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar de Visitante */}
      <nav className="fixed top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.71l-1.99 1.99C8.38 20.35 10.6 21 13 21c4.97 0 9-4.03 9-9h3l-4-4zM5 16l4-4H6c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.71l1.99-1.99C15.62 3.65 13.4 3 11 3c-4.97 0-9 4.03-9 9H0l4 4z"/></svg>
            </div>
            <span className="text-xl font-black tracking-tighter">Grafica<span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => openModal('login')}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => openModal('signup')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 active:scale-95"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest animate-slideDown">
            Google Integration Enabled
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight animate-slideDown" style={{ animationDelay: '0.1s' }}>
            Domine sua produção com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">acesso inteligente.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-slideDown" style={{ animationDelay: '0.2s' }}>
            Acesse seus dados de qualquer lugar vinculando sua conta Google. Gerencie orçamentos, pedidos e equipe com a segurança que você já conhece.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-slideDown" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => openModal('signup')}
              className="group relative px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
            >
              Criar Conta Gratuita
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suporte Google SSO</span>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              title: "Login Rápido",
              desc: "Acesse sua conta em um clique usando Google. Sem precisar decorar mais uma senha complexa.",
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
              color: "indigo"
            },
            {
              title: "Privacidade Google",
              desc: "Herdamos os padrões de segurança do Google para garantir que seus dados permaneçam seus.",
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
              color: "emerald"
            },
            {
              title: "Sincronização Total",
              desc: "Independentemente do dispositivo, seu login Google garante que sua gráfica esteja sempre à mão.",
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>,
              color: "violet"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className={`w-14 h-14 bg-${feature.color}-50 text-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2024 GraficaPro. Login com Google Habilitado.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
