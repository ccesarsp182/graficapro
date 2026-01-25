
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabase';

interface LandingPageProps {
  onAuthSuccess: (user: User) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthSuccess, isDarkMode, toggleTheme }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (signUpError) throw signUpError;
        
        // Se o email_confirmed_at for nulo e não houver erro, o Supabase enviou um e-mail de confirmação
        if (data.user && !data.session) {
          setError('E-mail de confirmação enviado! Verifique sua caixa de entrada para ativar sua conta.');
          setIsAuthenticating(false);
          return;
        }

        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            name: name,
            email: email,
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            name: data.user.user_metadata.name || 'Usuário',
            email: data.user.email || '',
          });
        }
      }
    } catch (err: any) {
      console.error('Erro de Autenticação:', err);
      let message = err.message || 'Erro na autenticação.';
      
      // Tratamento específico para o erro de limite de e-mail do Supabase
      if (message.includes('rate limit exceeded')) {
        message = 'Limite de e-mails atingido! O Supabase permite apenas 3 novos cadastros por hora. Aguarde um momento ou desative a "Confirmação de E-mail" no painel do Supabase para testes.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'E-mail ou senha incorretos.';
      } else if (message.includes('User already registered')) {
        message = 'Este e-mail já está cadastrado. Tente fazer login.';
      }
      
      setError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const openModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setIsAuthenticating(false);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-300 selection:bg-indigo-100 selection:text-indigo-700 animate-fadeIn">
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 p-10 animate-scaleIn relative overflow-hidden">
            {isAuthenticating && (
              <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Processando...</p>
              </div>
            )}

            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.71l-1.99 1.99C8.38 20.35 10.6 21 13 21c4.97 0 9-4.03 9-9h3l-4-4zM5 16l4-4H6c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.71l1.99-1.99C15.62 3.65 13.4 3 11 3c-4.97 0-9 4.03-9 9H0l4 4z"/></svg>
              </div>
              <h3 className="text-2xl font-black tracking-tight dark:text-white">{authMode === 'signup' ? 'Criar Conta' : 'Boas-vindas'}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{authMode === 'signup' ? 'Comece a gerenciar sua gráfica hoje.' : 'Entre com suas credenciais para acessar.'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                  <input 
                    required 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm dark:text-white" 
                    placeholder="Sua Gráfica ou Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm dark:text-white" 
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm dark:text-white pr-12" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`p-4 rounded-2xl text-xs font-bold text-center mt-2 ${error.includes('enviado') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 mt-4"
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

      <nav className="fixed top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6a5.87 5.87 0 01-2.8-.71l-1.99 1.99C8.38 20.35 10.6 21 13 21c4.97 0 9-4.03 9-9h3l-4-4zM5 16l4-4H6c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.71l1.99-1.99C15.62 3.65 13.4 3 11 3c-4.97 0-9 4.03-9 9H0l4 4z"/></svg>
            </div>
            <span className="text-xl font-black tracking-tighter dark:text-white">Grafica<span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90">
              {isDarkMode ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>}
            </button>
            <button onClick={() => openModal('login')} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Entrar</button>
            <button onClick={() => openModal('signup')} className="bg-slate-900 dark:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-xl shadow-slate-100 dark:shadow-none active:scale-95">Começar Agora</button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest animate-slideDown">
            Integração com Supabase Habilitada
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight animate-slideDown">
            Gerencie sua gráfica com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">banco de dados real.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slideDown">
            Seus dados agora estão seguros e sincronizados no Supabase. Acesse de qualquer lugar, gerencie orçamentos e pedidos com persistência garantida.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-slideDown">
            <button onClick={() => openModal('signup')} className="group px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3">
              Criar Conta Gratuita
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
