import React from 'react';
import { Menu, X, Wallet, ShieldCheck, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = React.useState(false);

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <button
      onClick={() => {
        onNavigate(to);
        setIsOpen(false);
      }}
      className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50"
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('HOME')}>
            <Wallet className="h-8 w-8 text-brand-600" />
            <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">
              tudinero<span className="text-brand-600">mueve</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('HOME')} className="text-slate-600 hover:text-brand-600 font-medium">Inicio</button>
            <button onClick={() => onNavigate('SERVICES')} className="text-slate-600 hover:text-brand-600 font-medium">Servicios</button>
            <button onClick={() => onNavigate('CONTACT')} className="text-slate-600 hover:text-brand-600 font-medium">Contacto</button>
            
            {currentUser ? (
              <div className="flex items-center gap-4 ml-4">
                <span className="text-sm font-medium text-slate-500 hidden lg:block">Hola, {currentUser.fullName.split(' ')[0]}</span>
                <button
                  onClick={() => onNavigate(currentUser.role === 'CLIENT' ? 'CLIENT_DASHBOARD' : 'ADMIN_DASHBOARD')}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  {currentUser.role === 'CLIENT' ? <UserIcon size={18} /> : <ShieldCheck size={18} />}
                  Mi Cuenta
                </button>
                <button onClick={onLogout} className="text-sm text-slate-400 hover:text-red-500">Salir</button>
              </div>
            ) : (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                >
                  <UserIcon size={16}/> Mi Cuenta
                </button>
                
                {isAuthMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fadeIn z-50">
                     <button onClick={() => { onNavigate('REGISTER_CLIENT'); setIsAuthMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700 font-bold border-b border-slate-50">
                        <UserPlus size={16} className="text-brand-600"/>
                        Registrarse (Cliente)
                     </button>
                     <button onClick={() => { onNavigate('LOGIN_CLIENT'); setIsAuthMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-600">
                        <LogIn size={16}/>
                        Acceso Cliente
                     </button>
                     <button onClick={() => { onNavigate('LOGIN_ADMIN'); setIsAuthMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-600">
                        <ShieldCheck size={16}/>
                        Acceso Admin
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="HOME" label="Inicio" />
            <NavLink to="SERVICES" label="Servicios" />
            <NavLink to="CONTACT" label="Contacto" />
            {currentUser ? (
               <>
                <NavLink to={currentUser.role === 'CLIENT' ? 'CLIENT_DASHBOARD' : 'ADMIN_DASHBOARD'} label="Mi Panel" />
                <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-red-500 font-medium">Cerrar Sesión</button>
               </>
            ) : (
               <>
                 <NavLink to="REGISTER_CLIENT" label="Registrarse" />
                 <NavLink to="LOGIN_CLIENT" label="Acceso Cliente" />
                 <NavLink to="LOGIN_ADMIN" label="Acceso Admin" />
               </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};