import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExchangeModal } from './components/ExchangeModal';
import { ClientDashboard, TabId } from './views/ClientDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { MockBackend } from './services/mockBackend';
import { User, SystemConfig } from './types';
import { ArrowRight, MessageCircle, BarChart3, Shield, Mail, Instagram, Twitter, ChevronDown, ChevronUp, Zap, Globe, Wallet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// --- CALCULATOR WIDGET COMPONENT ---
const CalculatorWidget = ({ onCotizar, onAmountChange, onTabChange, initialAmount, initialTab }: { onCotizar: () => void, onAmountChange: (v: number) => void, onTabChange: (v: 'VES'|'USDT') => void, initialAmount: number, initialTab: 'VES'|'USDT' }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [tab, setTab] = useState<'VES' | 'USDT' | 'USD'>(initialTab);
  const [config, setConfig] = useState<SystemConfig>(MockBackend.getConfig());
  const [quote, setQuote] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setConfig(MockBackend.getConfig()), 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const target = tab === 'USDT' ? 'USDT' : 'VES';
    const result = MockBackend.calculateQuote(amount, target);
    setQuote(result);
    // Sync up to parent
    onAmountChange(amount);
    if(tab !== 'USD') onTabChange(target);
  }, [amount, tab, config]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-w-md w-full relative z-20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 text-lg">Vender PayPal</h3>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setTab('VES')} className={`px-3 py-1 text-xs font-bold rounded transition ${tab === 'VES' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>VES</button>
          <button onClick={() => setTab('USDT')} className={`px-3 py-1 text-xs font-bold rounded transition ${tab === 'USDT' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}>USDT</button>
        </div>
      </div>

      {/* INPUT */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Envías (PayPal Bruto)</label>
        <div className="relative">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-4 text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
          <span className="absolute right-4 top-5 font-bold text-slate-400">USD</span>
        </div>
      </div>

      {/* OUTPUT */}
      <div className="mb-6 relative">
         <div className="absolute left-1/2 -top-5 -translate-x-1/2 bg-white border border-slate-200 rounded-full p-1 text-slate-400 z-10">
            <ArrowRight size={16} className="rotate-90" />
         </div>
         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recibes (Estimado)</label>
         <div className="w-full p-4 bg-brand-50 border border-brand-100 rounded-xl">
            <div className="flex justify-between items-baseline">
               <span className="text-3xl font-extrabold text-brand-700">{(quote?.finalAmount || 0).toFixed(2)}</span>
               <span className="font-bold text-brand-600">{tab === 'VES' ? 'Bs' : 'USDT'}</span>
            </div>
            
            <div className="flex justify-between items-center mt-1 border-t border-brand-100 pt-2">
               <p className="text-xs text-brand-600 font-medium">Tasa: {(quote?.rate || 0).toFixed(2)}</p>
               {tab === 'VES' && quote && (
                  <div className="flex gap-2">
                     <p className="text-[10px] text-brand-600 font-bold bg-white/60 px-2 py-0.5 rounded">
                        ${(quote.finalAmount / (quote.rate || 1)).toFixed(2)} Neto
                     </p>
                     {quote.bcvEquivalent > 0 && (
                        <p className="text-[10px] text-blue-600 font-bold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100">
                            ${(quote.bcvEquivalent).toFixed(2)} BCV
                        </p>
                     )}
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* DETAILS ACCORDION */}
      <div className="mb-6">
        <button 
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 transition"
        >
          {detailsOpen ? 'Ocultar desglose' : 'Ver desglose de costos'} 
          {detailsOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </button>
        
        {detailsOpen && quote && (
          <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-lg text-xs animate-fadeIn">
             <div className="flex justify-between text-slate-600">
               <span>Comisión PayPal (Externo)</span>
               <span className="text-red-500">-${(quote.ppFee || 0).toFixed(2)}</span>
             </div>
             {/* Only show "Service Fee" or aggregated fees to client, not internal breakdown unless desired */}
             <div className="flex justify-between text-slate-600">
               <span>Comisión Servicio</span>
               {/* Ops deductions are often hidden or merged into rate, but if transparent: */}
               <span className="text-red-500">-${((quote.serviceFee || 0) + (quote.opsDeductions || 0)).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200 font-bold">
               <span>Monto a entregar $</span>
               <span>${((quote.finalAmount || 0) / (quote.rate || 1)).toFixed(2)}</span>
             </div>
             {tab === 'VES' && quote.bcvEquivalent > 0 && (
                 <div className="flex justify-between text-blue-600 font-medium">
                   <span>Monto BCV equivalente $</span>
                   <span>${(quote.bcvEquivalent).toFixed(2)}</span>
                 </div>
             )}
          </div>
        )}
      </div>

      <button 
        onClick={onCotizar}
        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transition-transform active:scale-95"
      >
        Comenzar Intercambio
      </button>
      
      <p className="text-[10px] text-center text-slate-400 mt-4">
        Tasas actualizadas en tiempo real.
      </p>
    </div>
  );
};


// --- MAIN APP ---
function App() {
  const [view, setView] = useState<string>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(MockBackend.getConfig());
  
  // Widget State (Lifted up to pass to modal)
  const [widgetAmount, setWidgetAmount] = useState(100);
  const [widgetCurrency, setWidgetCurrency] = useState<'VES'|'USDT'>('VES');
  
  // Dashboard navigation state
  const [dashboardTab, setDashboardTab] = useState<TabId>('SELL');

  // Registration State
  const [regError, setRegError] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
     setConfig(MockBackend.getConfig());
     const i = setInterval(() => setConfig(MockBackend.getConfig()), 3000);
     return () => clearInterval(i);
  }, []);

  const handleLogin = (email: string) => {
    const loggedUser = MockBackend.login(email);
    if (loggedUser) {
      setUser(loggedUser);
      setView(loggedUser.role === 'CLIENT' ? 'CLIENT_DASHBOARD' : 'ADMIN_DASHBOARD');
      setDashboardTab('SELL'); // Default to SELL on regular login
    } else {
      alert("Usuario no encontrado (Prueba 'admin@tdm.com')");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setRegError('');
      setIsRegistering(true);

      // Simulate a small network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const form = e.target as any;
      const newUser = {
          fullName: `${form.firstName.value} ${form.lastName.value}`,
          email: form.email.value,
          password: form.password.value,
          phone: form.phone.value,
          country: form.country.value,
          paypalEmail: form.paypalEmail.value
      };
      
      const res = MockBackend.register(newUser);
      
      if(res.success && res.user) {
          setUser(res.user);
          setView('CLIENT_DASHBOARD');
          setDashboardTab('SELL');
          setRegError('');
      } else {
          setRegError(res.error || "Ocurrió un error al registrar. Verifique sus datos.");
      }
      setIsRegistering(false);
  };

  const handleContact = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as any;
      MockBackend.sendMessage({
          fullName: `${form.firstName.value} ${form.lastName.value}`,
          email: form.email.value,
          phone: form.phone.value,
          message: form.message.value,
          subject: form.subject.value
      });
      alert("Mensaje enviado con éxito. Te contactaremos pronto.");
      setView('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    setView('HOME');
  };

  const iconMap: Record<string, any> = { 'MessageCircle': MessageCircle, 'BarChart3': BarChart3, 'Shield': Shield, 'Globe': Globe, 'Zap': Zap, 'Wallet': Wallet };

  const renderView = () => {
    switch (view) {
      case 'CLIENT_DASHBOARD':
        return user ? <ClientDashboard user={user} initialTab={dashboardTab} /> : <div>Acceso denegado</div>;
      case 'ADMIN_DASHBOARD':
        return user ? <AdminDashboard currentUser={user} /> : <div>Acceso denegado</div>;
      
      case 'LOGIN_CLIENT':
      case 'LOGIN_ADMIN':
        return (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
                  {view === 'LOGIN_CLIENT' ? 'Acceso Cliente' : 'Acceso Administrativo'}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (e.target as any).email.value;
                handleLogin(email);
              }}>
                <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico</label>
                <input name="email" type="email" placeholder="tu@email.com" className="w-full p-3 border border-slate-300 rounded-lg mb-4" required />
                
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                <input name="password" type="password" className="w-full p-3 border border-slate-300 rounded-lg mb-6" required />
                
                <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition">Entrar</button>
              </form>
              {view === 'LOGIN_CLIENT' && (
                  <p className="mt-4 text-center text-sm text-slate-500">
                      ¿No tienes cuenta? <button onClick={() => setView('REGISTER_CLIENT')} className="text-brand-600 font-bold hover:underline">Regístrate</button>
                  </p>
              )}
            </div>
          </div>
        );

      case 'REGISTER_CLIENT':
          return (
            <div className="flex justify-center items-center py-12">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl animate-fadeIn border border-slate-100">
                    <h2 className="text-2xl font-bold mb-2 text-slate-800">Crear Cuenta Cliente</h2>
                    <p className="text-slate-500 mb-6 text-sm">Regístrate para gestionar tus cambios de forma segura.</p>
                    
                    <form onSubmit={handleRegister} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre *</label>
                            <input name="firstName" className="w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellido *</label>
                            <input name="lastName" className="w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo PayPal *</label>
                            <input name="paypalEmail" type="email" className="w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Contacto *</label>
                            <input name="email" type="email" className="w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono *</label>
                            <input name="phone" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="+58..." required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">País *</label>
                            <input name="country" className="w-full p-3 border border-slate-300 rounded-lg" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className={`block text-xs font-bold uppercase mb-1 ${regError.includes('contraseña') ? 'text-red-600' : 'text-slate-500'}`}>
                                Contraseña (Min 8 caracteres, 1 especial !@#$%^&*) *
                            </label>
                            <input 
                                name="password" 
                                type="password" 
                                className={`w-full p-3 border rounded-lg ${regError.includes('contraseña') ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-slate-300'}`} 
                                required 
                            />
                        </div>

                        <div className="md:col-span-2 mt-4 bg-slate-50 p-4 rounded text-xs text-slate-500 flex gap-2 items-start">
                             <input type="checkbox" required className="mt-1" />
                             <p>Acepto los <a href="#" className="text-brand-600 underline">términos y condiciones</a> del sitio y declaro ser el titular de los datos ingresados.</p>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            {regError && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 mb-4 border border-red-100">
                                    <AlertTriangle size={18} className="shrink-0 mt-0.5"/> 
                                    <span>{regError}</span>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isRegistering}
                                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isRegistering ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20}/>
                                        Creando cuenta...
                                    </>
                                ) : (
                                    'Registrarme'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          );

      case 'SERVICES':
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                 <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Nuestros Servicios</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    {config.design.services.map(s => {
                       const IconComp = iconMap[s.iconName] || MessageCircle;
                       return <ServiceCard key={s.id} icon={<IconComp size={32} />} title={s.title} desc={s.description} />;
                    })}
                 </div>
            </div>
        );
      case 'CONTACT':
          return (
              <div className="max-w-4xl mx-auto px-4 py-16">
                  <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Contáctanos</h2>
                  <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm">
                      <form className="space-y-4" onSubmit={handleContact}>
                          <div className="grid grid-cols-2 gap-2">
                             <input name="firstName" placeholder="Nombre" className="w-full p-3 border rounded-lg" required />
                             <input name="lastName" placeholder="Apellido" className="w-full p-3 border rounded-lg" required />
                          </div>
                          <input name="phone" placeholder="Teléfono" className="w-full p-3 border rounded-lg" required />
                          <input name="email" type="email" placeholder="Tu Email" className="w-full p-3 border rounded-lg" required />
                          <input name="subject" placeholder="Asunto" className="w-full p-3 border rounded-lg" required />
                          <textarea name="message" placeholder="Mensaje" rows={4} className="w-full p-3 border rounded-lg" required></textarea>
                          <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-lg w-full">Enviar Mensaje</button>
                      </form>
                      <div className="flex flex-col justify-center space-y-6">
                          <h3 className="text-xl font-semibold">Síguenos</h3>
                          <div className="flex gap-4">
                              <button className="p-3 bg-slate-100 rounded-full hover:bg-brand-100 text-brand-600"><Twitter/></button>
                              <button className="p-3 bg-slate-100 rounded-full hover:bg-brand-100 text-brand-600"><Instagram/></button>
                              <button className="p-3 bg-slate-100 rounded-full hover:bg-brand-100 text-brand-600"><Mail/></button>
                          </div>
                          <p className="text-slate-500 text-sm">
                              Atención personalizada de Lunes a Viernes.<br/>
                              support@tudineromueve.com
                          </p>
                      </div>
                  </div>
              </div>
          );
      case 'HOME':
      default:
        return (
          <>
            {/* HERO WITH CALCULATOR */}
            <header className="relative bg-slate-50 overflow-hidden min-h-[85vh] flex items-center">
               <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl z-0"></div>
               <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-brand-50 to-transparent z-0 opacity-50 rounded-bl-[100px]"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-block px-4 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-6">
                       🚀 La forma inteligente de cambiar
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                      {config.design.heroTitle}
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                      {config.design.heroSubtitle}
                    </p>
                    <div className="flex gap-4">
                      <button onClick={() => setView('SERVICES')} className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition">
                         Nuestros Servicios
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center lg:justify-end">
                     <CalculatorWidget 
                        onCotizar={() => setIsModalOpen(true)}
                        onAmountChange={setWidgetAmount}
                        onTabChange={setWidgetCurrency}
                        initialAmount={widgetAmount}
                        initialTab={widgetCurrency}
                     />
                  </div>
                </div>
              </div>
            </header>

            {/* LIVE RATES BANNER */}
            <div className="bg-slate-900 py-4 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-white overflow-hidden">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Mercado en vivo</span>
                    </div>
                    <div className="flex gap-8 text-sm font-mono overflow-x-auto">
                         <span>BTC: <span className="text-green-400">$64,230</span></span>
                         <span>ETH: <span className="text-green-400">$3,450</span></span>
                         <span>USDT/VES: <span className="text-green-400 font-bold">{MockBackend.getClientRate('VES')}</span></span>
                    </div>
                </div>
            </div>

            {/* FEATURED SERVICES SHORTCUT (CMS Controlled) */}
            <div className="max-w-7xl mx-auto py-20 px-4">
                <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-slate-900">¿Qué podemos hacer por ti?</h2>
                   <p className="text-slate-500 mt-2">Soluciones financieras adaptadas a freelancers y empresas.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {config.design.services.map(s => {
                       const IconComp = iconMap[s.iconName] || MessageCircle;
                       return (
                          <div key={s.id} onClick={() => setIsModalOpen(true)} className="cursor-pointer group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                              <div className="h-14 w-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                  <IconComp size={28} />
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                              <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                          </div>
                       );
                    })}
                </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar 
        currentUser={user} 
        onNavigate={(page) => {
             setView(page);
             if (page === 'CLIENT_DASHBOARD') setDashboardTab('SELL'); // Reset tab when clicking menu
        }} 
        onLogout={handleLogout} 
      />
      
      {renderView()}

      <ExchangeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        currentUser={user}
        initialAmount={widgetAmount}
        initialCurrency={widgetCurrency}
        onSuccess={(transactingUser) => {
            if (transactingUser) {
                setUser(transactingUser);
                setDashboardTab('OPERATIONS'); // Force view to operations history to prevent double submission
                setView('CLIENT_DASHBOARD');
            } else if (user) {
                setDashboardTab('OPERATIONS');
                setView('CLIENT_DASHBOARD');
            } else {
                alert("Solicitud creada. Inicia sesión para ver el estado.");
                setView('LOGIN_CLIENT');
            }
        }}
      />
      
      {/* GLOBAL WHATSAPP BUTTON */}
      <a 
         href={`https://wa.me/${config.design.whatsappNumber}`} 
         target="_blank" 
         rel="noreferrer" 
         className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center gap-2 z-50"
      >
         <MessageCircle size={24} />
         <span className="font-bold text-sm hidden md:block">Soporte</span>
      </a>

      <footer className="bg-white border-t border-slate-200 mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
              <p>{config.design.footerText}</p>
          </div>
      </footer>
    </div>
  );
}

const ServiceCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
        <div className="inline-flex p-4 rounded-full bg-brand-50 text-brand-600 mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

export default App;