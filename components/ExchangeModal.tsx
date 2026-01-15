import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Calculator, CheckCircle, Loader2, FileText, AlertTriangle, Clock } from 'lucide-react';
import { MockBackend } from '../services/mockBackend';
import { User } from '../types';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccess: (user?: User) => void;
  initialAmount: number;
  initialCurrency: 'VES' | 'USDT';
}

type Step = 'QUOTE' | 'IDENTIFY' | 'CONFIRM';

export const ExchangeModal: React.FC<ExchangeModalProps> = ({ isOpen, onClose, currentUser, onSuccess, initialAmount, initialCurrency }) => {
  const [step, setStep] = useState<Step>('QUOTE');
  const [amount, setAmount] = useState<number>(initialAmount);
  const [currency, setCurrency] = useState<'VES' | 'USDT'>(initialCurrency);
  const [quote, setQuote] = useState(MockBackend.calculateQuote(initialAmount, initialCurrency));
  const [config] = useState(MockBackend.getConfig());
  
  // Use a Ref for immediate lock, preventing double submissions even before React state updates
  const submittingRef = useRef(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: currentUser?.fullName.split(' ')[0] || '',
    lastName: currentUser?.fullName.split(' ')[1] || '',
    paypalEmail: currentUser?.paypalEmail || '', 
    phone: currentUser?.phone || '',
    note: '',
    password: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when Modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('QUOTE');
      setAmount(initialAmount);
      setCurrency(initialCurrency);
      setQuote(MockBackend.calculateQuote(initialAmount, initialCurrency));
      setIsSubmitting(false);
      submittingRef.current = false; // Reset lock
    }
  }, [isOpen, initialAmount, initialCurrency]);

  useEffect(() => {
      setQuote(MockBackend.calculateQuote(amount, currency));
  }, [amount, currency]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'QUOTE') setStep('IDENTIFY');
    else if (step === 'IDENTIFY') setStep('CONFIRM');
  };

  const handleConfirm = async () => {
    // Immediate Guard Clause
    if (submittingRef.current) return;
    submittingRef.current = true;
    
    setIsSubmitting(true);

    try {
        await new Promise(r => setTimeout(r, 1500)); // Simulate network

        let activeUser: User | null = currentUser || null;
        const fullClientName = currentUser?.fullName || `${formData.firstName} ${formData.lastName}`;

        // Logic to Create or Find User if not logged in
        if (!activeUser) {
          const registerRes = MockBackend.register({
            fullName: fullClientName,
            email: formData.paypalEmail, // Using PayPal email as simplified ID/Contact for demo
            phone: formData.phone,
            paypalEmail: formData.paypalEmail,
            password: formData.password || '123456'
          });

          if (registerRes.success && registerRes.user) {
            activeUser = registerRes.user;
          } else {
            // Fallback: try to find user if it already exists
            const existingUser = MockBackend.getUsers().find(u => u.email === formData.paypalEmail);
            if (existingUser) {
                activeUser = existingUser;
            } else {
                alert(registerRes.error || "Error creando usuario o usuario ya existente.");
                setIsSubmitting(false);
                submittingRef.current = false;
                return;
            }
          }
        }

        if (activeUser) {
          MockBackend.createTransaction({
            clientId: activeUser.id,
            clientName: fullClientName,
            type: 'EXCHANGE_PAYPAL',
            amountIn: amount,
            amountOut: quote.finalAmount,
            rateApplied: quote.rate,
            internalNotes: formData.note
          });
          
          // Order is important: Close first to clean up UI, then Success to trigger Navigation
          onClose(); 
          onSuccess(activeUser);
        }
    } catch (error) {
        console.error("Transaction failed", error);
        setIsSubmitting(false);
        submittingRef.current = false;
    }
  };

  const isIdentifyValid = () => {
      if (currentUser) return true;
      return formData.firstName && formData.lastName && formData.paypalEmail && formData.phone;
  };

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
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Envías (Saldo PayPal)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        />
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
                      <label className="block text-xs font-bold text-brand-800 uppercase mb-1">Recibes (Estimado)</label>
                      <div className="text-3xl font-extrabold text-brand-700">
                        {quote.finalAmount.toFixed(2)} <span className="text-sm font-bold text-brand-600">{currency === 'VES' ? 'VES / Bs' : 'USDT'}</span>
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
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                            placeholder="Tu Nombre"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Apellido *</label>
                            <input
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
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
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                        value={formData.paypalEmail}
                        onChange={e => setFormData({...formData, paypalEmail: e.target.value})}
                        placeholder="ejemplo@correo.com"
                        />
                    </div>

                    {/* PHONE (Mandatory) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Teléfono (WhatsApp) *</label>
                        <input
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+58 4XX XXX XXXX"
                        />
                    </div>

                    {/* NOTE (Optional) */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nota (Opcional)</label>
                        <textarea
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm h-16"
                        placeholder="Comentario adicional para la factura..."
                        value={formData.note}
                        onChange={e => setFormData({...formData, note: e.target.value})}
                        />
                    </div>

                    {/* PASSWORD (Account Creation - Kept minimal) */}
                    {!currentUser && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contraseña (Para ver tu recibo)</label>
                        <input
                          type="password"
                          className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          placeholder="Crea una contraseña segura"
                        />
                      </div>
                    )}
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
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Envías PayPal:</span>
                        <span className="font-bold text-slate-900">${amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Recibes:</span>
                        <span className="font-bold text-brand-600 text-lg">{quote.finalAmount.toFixed(2)} {currency}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                        <span className="text-xs text-slate-500">Factura a:</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{formData.paypalEmail}</span>
                      </div>
                    </div>

                    <div className="text-center space-y-4">
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
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmar Operación'}
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