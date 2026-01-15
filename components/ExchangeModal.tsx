import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Calculator, CheckCircle, Loader2, FileText, AlertTriangle, Clock, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { MockBackend } from '../services/mockBackend';
import { User } from '../types';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (user?: User) => void;
  initialAmount: number;
  initialCurrency: 'VES' | 'USDT';
  initialOperationMode: 'BUY' | 'SELL';
  initialGateway: string;
}

type Step = 'QUOTE' | 'IDENTIFY' | 'CONFIRM';

const COUNTRY_CODES = [
    { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
    { code: '+1',  flag: '🇺🇸', name: 'USA' },
    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
    { code: '+34', flag: '🇪🇸', name: 'España' },
    { code: '+507', flag: '🇵🇦', name: 'Panamá' },
    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
    { code: '+56', flag: '🇨🇱', name: 'Chile' },
    { code: '+51', flag: '🇵🇪', name: 'Perú' },
    { code: '+52', flag: '🇲🇽', name: 'México' },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
    { code: '+55', flag: '🇧🇷', name: 'Brasil' },
];

export const ExchangeModal: React.FC<ExchangeModalProps> = ({ 
  isOpen, onClose, currentUser, onSuccess, 
  initialAmount, initialCurrency, initialOperationMode, initialGateway 
}) => {
  const [step, setStep] = useState<Step>('QUOTE');
  const [amount, setAmount] = useState<number>(initialAmount);
  const [currency, setCurrency] = useState<'VES' | 'USDT'>(initialCurrency);
  const [operationMode, setOperationMode] = useState<'BUY' | 'SELL'>(initialOperationMode);
  
  // Calculate quote logic
  const [quote, setQuote] = useState(MockBackend.calculateQuote(initialAmount, initialCurrency, undefined, undefined, initialGateway));
  const [config] = useState(MockBackend.getConfig());
  
  // Breakdown Toggle State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Error state for better UX
  const [error, setError] = useState<string | null>(null);
  
  // Use a Ref for immediate lock, preventing double submissions
  const submittingRef = useRef(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: currentUser?.fullName.split(' ')[0] || '',
    lastName: currentUser?.fullName.split(' ')[1] || '',
    paypalEmail: currentUser?.paypalEmail || '', 
    phoneCode: '+58', // Default code
    phone: currentUser?.phone || '',
    // REPLACED NOTE WITH ACCOUNT FIELDS
    accountUser: '', 
    accountPassword: '',
    // Global password for registration (can be synced)
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when Modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('QUOTE');
      setAmount(initialAmount);
      setCurrency(initialCurrency);
      setOperationMode(initialOperationMode);
      setQuote(MockBackend.calculateQuote(initialAmount, initialCurrency, undefined, undefined, initialGateway));
      setIsSubmitting(false);
      setIsDetailsOpen(false); // Reset breakdown toggle
      setError(null);
      submittingRef.current = false;
      
      // Reset form
      setFormData(prev => ({
          ...prev,
          firstName: currentUser?.fullName.split(' ')[0] || '',
          lastName: currentUser?.fullName.split(' ')[1] || '',
          paypalEmail: currentUser?.paypalEmail || '',
          phone: currentUser?.phone || '', 
          phoneCode: prev.phoneCode,
          accountUser: currentUser?.email || '', // Pre-fill if known
          accountPassword: '',
          password: ''
      }));
    }
  }, [isOpen, initialAmount, initialCurrency, initialOperationMode, currentUser]);

  useEffect(() => {
      const target = currency;
      const result = MockBackend.calculateQuote(amount, target, undefined, undefined, initialGateway);
      setQuote(result);
  }, [amount, currency, operationMode]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'QUOTE') setStep('IDENTIFY');
    else if (step === 'IDENTIFY') setStep('CONFIRM');
  };

  const handleConfirm = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    
    setIsSubmitting(true);
    setError(null);

    try {
        await new Promise(r => setTimeout(r, 1500)); 

        let activeUser: User | null = currentUser || null;
        const fullClientName = currentUser?.fullName || `${formData.firstName} ${formData.lastName}`;
        
        // Combine Code + Number
        const finalPhone = formData.phone.startsWith('+') 
            ? formData.phone 
            : `${formData.phoneCode} ${formData.phone}`;

        // Logic to Create or Find User if not logged in
        if (!activeUser) {
          const existingUser = MockBackend.getUsers().find(u => u.email === formData.accountUser || u.email === formData.paypalEmail);
          
          if (existingUser) {
             activeUser = existingUser;
          } else {
              // Use the new fields for registration
              const registerRes = MockBackend.register({
                fullName: fullClientName,
                email: formData.accountUser, // Main email/User
                phone: finalPhone,
                paypalEmail: formData.paypalEmail,
                password: formData.accountPassword || formData.password || '123456'
              });

              if (registerRes.success && registerRes.user) {
                activeUser = registerRes.user;
              } else {
                setError(registerRes.error || "Error creando usuario. Verifique sus datos.");
                setIsSubmitting(false);
                submittingRef.current = false;
                return;
              }
          }
        }

        if (activeUser) {
          const finalAmountIn = amount;
          const finalAmountOut = operationMode === 'SELL' ? quote.finalAmount : (amount / (quote.rate || 1));

          MockBackend.createTransaction({
            clientId: activeUser.id,
            clientName: fullClientName,
            type: 'EXCHANGE_PAYPAL',
            amountIn: finalAmountIn,
            amountOut: finalAmountOut,
            rateApplied: quote.rate,
            internalNotes: `${operationMode} MODE - User: ${formData.accountUser}`
          });
          
          onClose(); 
          onSuccess(activeUser);
        }
    } catch (error) {
        console.error("Transaction failed", error);
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
        setIsSubmitting(false);
        submittingRef.current = false;
    }
  };

  const isIdentifyValid = () => {
      if (currentUser) return true;
      // Validar campos obligatorios básicos y los nuevos campos de cuenta
      const basicValid = formData.firstName && formData.lastName && formData.paypalEmail && formData.phone;
      const accountValid = formData.accountUser && formData.accountPassword;
      return basicValid && accountValid;
  };

  const gatewayLabel = initialGateway === 'PAYPAL' ? 'PayPal' : initialGateway;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition" onClick={onClose}>
              <X size={20} />
            </div>

            <div className="w-full">
              <div className="mt-2 text-left w-full">
                <h3 className="text-lg leading-6 font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calculator size={20} className="text-brand-600" />
                  Intercambio de Saldo
                </h3>

                {/* STEPS VISUALIZER */}
                <div className="flex items-center justify-between mb-8 text-xs font-medium text-slate-400">
                  <div className={`flex items-center gap-1.5 ${step === 'QUOTE' ? 'text-brand-600' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'QUOTE' ? 'border-brand-600 bg-brand-50 font-bold' : 'border-slate-200'}`}>1</div>
                    Cotizar
                  </div>
                  <div className={`h-px w-8 bg-slate-100`}></div>
                  <div className={`flex items-center gap-1.5 ${step === 'IDENTIFY' ? 'text-brand-600' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'IDENTIFY' ? 'border-brand-600 bg-brand-50 font-bold' : 'border-slate-200'}`}>2</div>
                    Datos
                  </div>
                  <div className={`h-px w-8 bg-slate-100`}></div>
                  <div className={`flex items-center gap-1.5 ${step === 'CONFIRM' ? 'text-brand-600' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'CONFIRM' ? 'border-brand-600 bg-brand-50 font-bold' : 'border-slate-200'}`}>3</div>
                    Confirmar
                  </div>
                </div>

                {/* STEP 1: QUOTE */}
                {step === 'QUOTE' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* TOGGLE SWITCH */}
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-4 relative">
                        <div 
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-md shadow-sm transition-all duration-300 ease-out ${operationMode === 'SELL' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                        ></div>
                        <button 
                            onClick={() => setOperationMode('SELL')}
                            className={`flex-1 relative z-10 py-1.5 text-xs font-black uppercase tracking-wider text-center transition-colors ${operationMode === 'SELL' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Vender
                        </button>
                        <button 
                            onClick={() => setOperationMode('BUY')}
                            className={`flex-1 relative z-10 py-1.5 text-xs font-black uppercase tracking-wider text-center transition-colors ${operationMode === 'BUY' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Comprar
                        </button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          {operationMode === 'SELL' ? `Envías (Saldo ${gatewayLabel})` : 'Pagas en'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        />
                         <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                             {operationMode === 'SELL' ? 'USD' : (currency === 'VES' ? 'VES' : 'USDT')}
                         </span>
                      </div>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                      <div className="bg-white border border-slate-200 rounded-full p-1.5 text-slate-400 shadow-sm">
                         <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>

                    <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 relative overflow-hidden">
                      <div className="absolute top-4 right-4 flex bg-white/50 p-0.5 rounded-lg">
                          <button onClick={() => setCurrency('VES')} className={`px-2 py-1 text-[10px] font-bold rounded ${currency === 'VES' ? 'bg-white shadow-sm text-brand-600' : 'text-brand-400'}`}>VES</button>
                          <button onClick={() => setCurrency('USDT')} className={`px-2 py-1 text-[10px] font-bold rounded ${currency === 'USDT' ? 'bg-white shadow-sm text-brand-600' : 'text-brand-400'}`}>USDT</button>
                      </div>
                      <label className="block text-xs font-bold text-brand-800 uppercase mb-1">
                          {operationMode === 'SELL' ? 'Recibes (Estimado)' : `Recibes (${gatewayLabel})`}
                      </label>
                      <div className="text-3xl font-extrabold text-brand-700">
                         {operationMode === 'SELL' 
                            ? quote.finalAmount.toFixed(2) 
                            : (amount / (quote.rate || 1)).toFixed(2) 
                         } 
                         <span className="text-sm font-bold text-brand-600 ml-1">
                             {operationMode === 'SELL' ? (currency === 'VES' ? 'VES / Bs' : 'USDT') : 'USD'}
                         </span>
                      </div>
                      <p className="text-[10px] text-brand-500 mt-2 font-medium">Tasa: {quote.rate.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* STEP 2: IDENTIFY */}
                {step === 'IDENTIFY' && (
                  <div className="space-y-4 animate-fadeIn">
                    {!currentUser && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nombre *</label>
                            <input
                            className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                            placeholder="Tu Nombre"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Apellido *</label>
                            <input
                            className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400"
                            value={formData.lastName}
                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                            placeholder="Tu Apellido"
                            />
                        </div>
                      </div>
                    )}
                    
                    {/* PAYPAL EMAIL (Mandatory for Invoice) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Correo PayPal (Para Factura) *</label>
                        <input
                        type="email"
                        className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400"
                        value={formData.paypalEmail}
                        onChange={e => setFormData({...formData, paypalEmail: e.target.value})}
                        placeholder="ejemplo@correo.com"
                        />
                    </div>

                    {/* PHONE (Mandatory) WITH COUNTRY SELECTOR - WIDER SELECTOR */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Teléfono (WhatsApp) *</label>
                        <div className="flex gap-2">
                             <div className="w-[180px] relative"> 
                                <select 
                                    className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs font-bold appearance-none truncate pr-6"
                                    value={formData.phoneCode}
                                    onChange={(e) => setFormData({...formData, phoneCode: e.target.value})}
                                >
                                    {COUNTRY_CODES.map(c => (
                                        <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-3 text-slate-500 pointer-events-none"/>
                             </div>
                             <input
                                className="flex-1 w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="412 123 4567"
                                type="tel"
                             />
                        </div>
                    </div>

                    {/* REPLACED NOTE WITH ACCOUNT REGISTRATION DATA */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="col-span-2">
                            <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-wider mb-2 border-b border-brand-100 pb-1">
                                Datos de Registro para Cuenta
                            </h4>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Usuario / Correo *</label>
                            <input
                                className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400"
                                placeholder="Tu Usuario"
                                value={formData.accountUser}
                                onChange={e => setFormData({...formData, accountUser: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contraseña *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm placeholder:text-slate-400 pr-8"
                                    placeholder="*******"
                                    value={formData.accountPassword}
                                    onChange={e => setFormData({...formData, accountPassword: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-2.5 text-slate-400 hover:text-brand-600"
                                >
                                    {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 'CONFIRM' && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5"><FileText size={16}/></div>
                        <p className="text-xs text-blue-800 leading-relaxed">
                            Recibirás una <strong>factura con el monto exacto</strong> en tu cuenta PayPal, la cual debes pagar para recibir tu cambio.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Detalles del Intercambio</h4>
                      
                      {/* NEW: OPERATION TYPE ROW */}
                      <div className="flex justify-between items-center mb-3">
                           <span className="text-sm text-slate-600">Tipo de Operación:</span>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${operationMode === 'SELL' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {operationMode === 'SELL' ? 'Venta de Saldo' : 'Recarga de Saldo'}
                           </span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">
                            {operationMode === 'SELL' ? 'Envías PayPal:' : 'Pagas:'}
                        </span>
                        <span className="font-bold text-slate-900">${amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-600">Recibes:</span>
                        <span className="font-bold text-brand-600 text-lg">
                            {operationMode === 'SELL' 
                                ? quote.finalAmount.toFixed(2) 
                                : (amount / (quote.rate || 1)).toFixed(2) 
                            } 
                            {operationMode === 'SELL' ? currency : ' USD'}
                        </span>
                      </div>

                      {/* COLLAPSIBLE DETAILS BREAKDOWN */}
                      <button 
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        className="text-[10px] text-brand-600 font-bold flex items-center gap-1 hover:underline mb-3 ml-auto"
                      >
                         {isDetailsOpen ? 'Ocultar detalles' : 'Ver desglose de costos'}
                         {isDetailsOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                      </button>

                      {isDetailsOpen && (
                          <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-2 mb-3 animate-fadeIn border border-slate-100">
                               <div className="flex justify-between text-slate-600">
                                   <span>Tasa de Cambio</span>
                                   <span className="font-mono">{quote.rate.toFixed(2)}</span>
                               </div>
                               {operationMode === 'SELL' && (
                                   <>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Comisión Pasarela (Est.)</span>
                                            <span className="text-red-500">-${(quote.ppFee || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Comisión Servicio</span>
                                            <span className="text-red-500">-${((quote.serviceFee || 0) + (quote.opsDeductions || 0)).toFixed(2)}</span>
                                        </div>
                                   </>
                               )}
                          </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                        <span className="text-xs text-slate-500">Factura a:</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{formData.paypalEmail}</span>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
                        {error && (
                             <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 flex items-center gap-2 justify-center animate-fadeIn">
                                <AlertTriangle size={16}/> {error}
                             </div>
                        )}
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                            Al presionar "Confirmar", aceptas los <a href="#" className="underline hover:text-brand-600">Términos y Condiciones</a> del servicio y confirmas que los fondos provienen de actividades lícitas.
                        </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-4 py-4 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
            {step === 'CONFIRM' ? (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-transparent shadow-lg shadow-brand-100 px-4 py-3 bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (operationMode === 'SELL' ? 'Confirmar Intercambio' : 'Confirmar Recarga')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={(step === 'IDENTIFY' && !isIdentifyValid())}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continuar
              </button>
            )}
            <button
              type="button"
              onClick={() => step === 'QUOTE' ? onClose() : setStep(s => s === 'CONFIRM' ? 'IDENTIFY' : 'QUOTE')}
              className="mt-0 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-4 py-3 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none transition-all"
            >
              {step === 'QUOTE' ? 'Cancelar' : 'Volver'}
            </button>
          </div>
          
          {step === 'CONFIRM' && (
             <div className="bg-slate-100 py-2 text-center border-t border-slate-200">
                 <p className="text-[10px] font-bold text-slate-500 flex items-center justify-center gap-1">
                    <Clock size={12}/> {config.design.processingTimeText}
                 </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};