import { Transaction, User, SystemConfig, TransactionStatus, CostGroup, ConfigProfile, Coupon, ContactMessage, GatewayProfile } from '../types';

const STORAGE_KEYS = {
  USERS: 'tdm_users_v2',
  TRANSACTIONS: 'tdm_transactions_v2',
  CONFIG: 'tdm_config_v14_gateways', // Bumped version for migration
  MESSAGES: 'tdm_messages'
};

const DEFAULT_CONFIG: SystemConfig = {
  notices: "Horario de atención: 8:00 AM - 6:00 PM EST",
  paypalExternalFee: { pct: 5.4, fixed: 0.30 }, // Legacy global fallback
  hierarchy: {
    level1: { canEditRates: false, canProcessPayments: false, canManageClients: true, canViewAudit: false, canEditCommissions: false },
    level2: { canEditRates: false, canProcessPayments: true, canManageClients: true, canViewAudit: true, canEditCommissions: false },
    level3: { canEditRates: true, canProcessPayments: true, canManageClients: true, canViewAudit: true, canEditCommissions: true }
  },
  design: {
     heroTitle: "Tu dinero mueve el mundo.",
     heroSubtitle: "Gestionamos tu capital con atención humana y tecnología financiera avanzada.",
     footerText: "© 2024 tudineromueve. Todos los derechos reservados.",
     processingTimeText: "Recibirás tu pago entre 10 - 25 minutos",
     whatsappNumber: "584120000000",
     socialLinks: [
         { id: 'soc-1', platform: 'WHATSAPP', label: 'Atención al Cliente', url: 'https://wa.me/584120000000', enabled: true },
         { id: 'soc-2', platform: 'INSTAGRAM', label: 'Instagram Oficial', url: 'https://instagram.com/tudineromueve', enabled: true },
         { id: 'soc-3', platform: 'EMAIL', label: 'Soporte Email', url: 'mailto:soporte@tdm.com', enabled: true }
     ],
     services: [
        { id: 's1', iconName: 'MessageCircle', title: 'Asesoría Financiera', description: 'Expertos listos para ayudarte a mover tu capital de forma inteligente.' },
        { id: 's2', iconName: 'BarChart3', title: 'Intercambio PayPal', description: 'La tasa más competitiva del mercado, procesada en minutos por humanos.' },
        { id: 's3', iconName: 'Shield', title: 'Cripto Activos', description: 'Compra y venta de USDT, BTC y ETH con total seguridad.' }
     ]
  },
  logistics: {
    descriptions: {
      internalCosts: "Gestione los costos operativos, rentabilidad global y perfiles automáticos.",
      ratesAndGateways: "Establezca la Tasa de Cambio por divisa y configure pasarelas de pago.",
      coupons: "Administre la vigencia y beneficios de cupones para clientes y referidos."
    },
    profiles: [],
    // NEW GATEWAY PROFILES STRUCTURE
    gatewayProfiles: [
        {
            id: 'gw-paypal',
            slug: 'PAYPAL',
            label: 'Saldo PayPal',
            iconName: 'Wallet',
            enabled: true,
            currencies: [
                {
                    code: 'VES', name: 'Bolívares', enabled: true,
                    rateMode: 'MANUAL',
                    manualRate: 45.50, // P2P Deductiva
                    secondaryRate: 46.00, // BCV Referencial
                    dynamicSetting: {
                       references: [
                          { id: 'r1', label: 'Promedio P2P', value: 46.50, isActive: true, isReferential: false },
                          { id: 'r2', label: 'BCV Oficial', value: 46.00, isActive: false, isReferential: true },
                       ],
                       profitRule: { mode: 'PCT_ONLY', pct: 12, fixed: 0 },
                       amountRanges: []
                    },
                    methods: [
                      { id: 'm1', name: 'Pago Móvil', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } },
                      { id: 'm2', name: 'Transferencia', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } }
                    ]
                },
                {
                    code: 'USDT', name: 'Tether (Cripto)', enabled: true,
                    rateMode: 'MANUAL',
                    manualRate: 0.95,
                    dynamicSetting: {
                       references: [
                          { id: 'r3', label: 'Mercado Spot', value: 1.00, isActive: true }
                       ],
                       profitRule: { mode: 'PCT_ONLY', pct: 5, fixed: 0 },
                       amountRanges: []
                    },
                    methods: [
                      { id: 'm3', name: 'Binance Pay', enabled: true, commission: { pct: 0, fixed: 1, enabled: true } },
                      { id: 'm4', name: 'On-Chain (TRC20)', enabled: true, commission: { pct: 0, fixed: 3, enabled: true } }
                    ]
                }
            ],
            costs: [
              {
                id: 'group_bank',
                label: 'Deducciones Bancarias (Recepción)',
                items: [
                  { id: 'c1', label: 'Comisión PayPal (Est.)', type: 'PCT', category: 'DEDUCTIVE', value: 5.4, enabled: true, isClientChargeable: true },
                  { id: 'c1b', label: 'Fijo PayPal', type: 'FIXED', category: 'DEDUCTIVE', value: 0.30, enabled: true, isClientChargeable: true },
                ]
              },
              {
                id: 'group_service',
                label: 'Servicios Administrativos',
                items: [
                   { id: 'c2', label: 'Gastos Operativos', type: 'FIXED', category: 'ADDITIVE', value: 0.50, enabled: true, isClientChargeable: true }
                ]
              }
            ]
        },
        {
            id: 'gw-usdt',
            slug: 'USDT',
            label: 'Criptomonedas',
            iconName: 'Bitcoin',
            enabled: true,
            currencies: [
                {
                    code: 'VES', name: 'Bolívares', enabled: true,
                    rateMode: 'MANUAL',
                    manualRate: 46.00,
                    secondaryRate: 46.00,
                    dynamicSetting: {
                       references: [],
                       profitRule: { mode: 'PCT_ONLY', pct: 5, fixed: 0 },
                       amountRanges: []
                    },
                    methods: [
                      { id: 'm1', name: 'Pago Móvil', enabled: true, commission: { pct: 0, fixed: 0, enabled: false } }
                    ]
                }
            ],
            costs: [
                {
                    id: 'group_net',
                    label: 'Costos de Red',
                    items: [
                        { id: 'c3', label: 'Fee de Red (Gas)', type: 'FIXED', category: 'DEDUCTIVE', value: 1.00, enabled: true, isClientChargeable: true }
                    ]
                }
            ]
        }
    ],
    coupons: [
      { 
        id: 'cp-1', code: 'BIENVENIDA', category: 'CLIENT', type: 'GLOBAL_PROMO', active: true, 
        expirationDate: '2025-12-31',
        description: 'Bono de bienvenida para nuevos usuarios',
        clientDiscount: { type: 'FIXED', value: 2 } 
      }
    ]
  }
};

const SEED_OWNER: User = {
  id: 'owner-1',
  fullName: 'Propietario',
  email: 'admin@tdm.com',
  password: 'admin',
  role: 'OWNER',
  isTwoFactorEnabled: false
};

const getStorage = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export class MockBackend {
  static getConfig(): SystemConfig {
    const config = getStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    
    // Migration Logic for new structure (if loading old config)
    if (!(config.logistics as any).gatewayProfiles) {
        return DEFAULT_CONFIG;
    }
    
    return config;
  }

  static updateConfig(newConfig: Partial<SystemConfig>): SystemConfig {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    setStorage(STORAGE_KEYS.CONFIG, updated);
    return updated;
  }

  // --- RATES & QUOTES ---
  static getClientRate(currencyCode: string, gatewaySlug: string = 'PAYPAL'): number {
    const config = this.getConfig();
    const gateway = config.logistics.gatewayProfiles.find(g => g.slug === gatewaySlug);
    if (!gateway) return 0;

    const currency = gateway.currencies.find(c => c.code === currencyCode);
    if (!currency) return 0;

    if (currency.rateMode === 'MANUAL') {
        return currency.manualRate; 
    } else {
        // Dynamic Fallback
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive) || { value: 0 };
        const refValue = activeRef.value;
        const profit = currency.dynamicSetting.profitRule;
        let margin = 0;
        
        if (profit.mode === 'PCT_ONLY' || profit.mode === 'MIXED') {
            margin += refValue * (profit.pct / 100);
        }
        
        if (profit.mode === 'FIXED_ONLY' || profit.mode === 'MIXED') margin += profit.fixed;
        
        return Math.max(0, refValue - margin);
    }
  }

  static calculateQuote(amountGross: number, currencyCode: string, profileId?: string, couponCode?: string, gatewaySlug: string = 'PAYPAL') {
    const config = this.getConfig();
    
    // 1. Find Gateway Profile
    const gateway = config.logistics.gatewayProfiles.find(g => g.slug === gatewaySlug) || config.logistics.gatewayProfiles[0];

    // 2. Calculate Costs based on Gateway's cost structure
    let opsDeductions = 0; // "DEDUCTIVE" (Client Chargeable)
    let serviceFee = 0;    // "ADDITIVE"
    let adminAbsorbedCosts = 0; // "DEDUCTIVE" (Admin Chargeable)
    let ppFee = 0; // Explicitly track "fee" type costs if needed for display, though generic costs handle it now

    gateway.costs.forEach(group => {
        group.items.forEach(item => {
            if(item.enabled) {
                let val = 0;
                // Calculate based on Gross Amount
                if(item.type === 'PCT') val = amountGross * (item.value / 100);
                else val = item.value;

                if(item.label.toLowerCase().includes('paypal')) ppFee += val; // Heuristic for UI display compatibility

                if (item.category === 'ADDITIVE') {
                    serviceFee += val; 
                } else {
                    const isChargeable = item.isClientChargeable !== false;
                    if (isChargeable) {
                        opsDeductions += val; 
                    } else {
                        adminAbsorbedCosts += val;
                    }
                }
            }
        });
    });

    const netPaypal = amountGross - ppFee; // Only for UI reference if using PayPal

    // Funds available for CLIENT calculation
    const clientBasis = amountGross - opsDeductions;
    const baseForExchange = Math.max(0, clientBasis - serviceFee);

    // Funds available for ADMIN (Net Internal Receipt)
    const netInternalReceipt = amountGross - opsDeductions - adminAbsorbedCosts;
    
    const currency = gateway.currencies.find(c => c.code === currencyCode);
    const rate = this.getClientRate(currencyCode, gatewaySlug); 
    
    let finalAmount = baseForExchange * rate;

    let bcvEquivalent = 0;
    let marketReferenceRate = 0; 

    if (currencyCode === 'VES' && currency) {
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive);
        marketReferenceRate = activeRef ? activeRef.value : (currency.manualRate * 1.05); 

        if (currency.secondaryRate) {
            bcvEquivalent = finalAmount / currency.secondaryRate;
        }
    }

    let appliedCoupon: Coupon | null = null;
    if (couponCode) {
        const coupon = config.logistics.coupons.find(c => c.code === couponCode && c.active);
        if (coupon) {
            appliedCoupon = coupon;
            if (coupon.clientDiscount.type === 'PCT') {
                 finalAmount = finalAmount * (1 + (coupon.clientDiscount.value / 100));
            } else {
                 finalAmount = finalAmount + coupon.clientDiscount.value; 
            }
        }
    }

    // --- PROFIT CALCULATION ---
    let profit = 0;
    const moneyHeld = netInternalReceipt; 

    if (currencyCode === 'VES' && marketReferenceRate > 0) {
        const costToCoverInUSD = finalAmount / marketReferenceRate;
        profit = moneyHeld - costToCoverInUSD;
    } else {
        profit = moneyHeld - (finalAmount / (rate || 1));
    }

    return {
        gross: amountGross,
        ppFee, // Returned for UI legacy compatibility
        netPaypal, // Returned for UI legacy compatibility
        opsDeductions, 
        adminAbsorbedCosts, 
        netInternalReceipt, 
        serviceFee,   
        baseForExchange,
        rate,
        finalAmount,
        bcvEquivalent,
        appliedCoupon,
        marketReferenceRate, 
        internalStats: {
            netProfitUSD: profit
        }
    };
  }

  // --- USERS & AUTH ---
  static getUsers(): User[] { return getStorage<User[]>(STORAGE_KEYS.USERS, [SEED_OWNER]); }
  
  static register(userData: Partial<User>): { success: boolean, user?: User, error?: string } {
    const users = this.getUsers();
    
    // Validations
    if (!userData.email || !userData.password || !userData.fullName) {
        return { success: false, error: 'Datos incompletos' };
    }
    
    // RELAXED PASSWORD CHECK FOR PROTOTYPE/DEMO
    // Original: const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
    if (userData.password.length < 3) {
        return { success: false, error: 'La contraseña es muy corta.' };
    }

    if (users.find(u => u.email === userData.email)) {
        return { success: false, error: 'El correo ya está registrado.' };
    }

    const newUser: User = { 
        id: `u-${Date.now()}`, 
        role: 'CLIENT', 
        savedCoupons: [],
        ...userData 
    } as User;
    
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return { success: true, user: newUser };
  }
  
  static login(email: string): User | null { return this.getUsers().find(u => u.email === email) || null; }
  static getAdmins(): User[] { return this.getUsers().filter(u => u.role === 'ADMIN' || u.role === 'OWNER'); }
  static createAdmin(admin: User): void { const users = this.getUsers(); users.push({ ...admin, id: `adm-${Date.now()}`, role: 'ADMIN' }); setStorage(STORAGE_KEYS.USERS, users); }
  
  // --- COUPONS (USER) ---
  static redeemCoupon(userId: string, code: string): { success: boolean, message: string } {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return { success: false, message: 'Usuario no encontrado' };

      const config = this.getConfig();
      const coupon = config.logistics.coupons.find(c => c.code === code && c.active);
      
      if (!coupon) return { success: false, message: 'Cupón inválido o expirado' };
      
      const user = users[userIndex];
      if (user.savedCoupons?.includes(code)) return { success: false, message: 'Ya has canjeado este cupón' };

      user.savedCoupons = [...(user.savedCoupons || []), code];
      users[userIndex] = user;
      setStorage(STORAGE_KEYS.USERS, users);
      
      return { success: true, message: 'Cupón agregado a tu billetera' };
  }

  // --- TRANSACTIONS ---
  static getTransactions(userId?: string): Transaction[] {
      const txs = getStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
      if (userId) return txs.filter(t => t.clientId === userId).sort((a,b) => b.createdAt - a.createdAt);
      return txs.sort((a,b) => b.createdAt - a.createdAt);
  }
  
  static createTransaction(tx: Partial<Transaction>): Transaction {
      const txs = this.getTransactions();
      const newTx: Transaction = { id: `tx-${Date.now()}`, status: 'PENDING', createdAt: Date.now(), updatedAt: Date.now(), type: 'EXCHANGE_PAYPAL', amountIn: 0, amountOut: 0, rateApplied: 0, clientId: '', clientName: '', ...tx } as Transaction;
      txs.push(newTx);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
      return newTx;
  }
  
  static updateTransactionStatus(txId: string, status: TransactionStatus, minutes?: number, rejectionReason?: string): void {
      let txs = this.getTransactions();
      txs = txs.map(t => { 
          if (t.id === txId) {
             return { 
                 ...t, 
                 status, 
                 updatedAt: Date.now(), 
                 timerEndAt: minutes ? Date.now() + (minutes * 60000) : t.timerEndAt,
                 rejectionReason: rejectionReason || t.rejectionReason
             }; 
          }
          return t; 
      });
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  static updateTransactionDestination(txId: string, data: Record<string, string>): void {
      let txs = this.getTransactions();
      txs = txs.map(t => t.id === txId ? { ...t, destinationData: data, updatedAt: Date.now() } : t);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  static confirmClientReceipt(txId: string): void {
      let txs = this.getTransactions();
      txs = txs.map(t => t.id === txId ? { ...t, clientConfirmed: true, updatedAt: Date.now() } : t);
      setStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  }

  // --- MESSAGES ---
  static getMessages(): ContactMessage[] {
      return getStorage<ContactMessage[]>(STORAGE_KEYS.MESSAGES, []).sort((a,b) => b.date - a.date);
  }

  static sendMessage(msg: Partial<ContactMessage>): void {
      const msgs = this.getMessages();
      msgs.push({ id: `msg-${Date.now()}`, read: false, date: Date.now(), ...msg } as ContactMessage);
      setStorage(STORAGE_KEYS.MESSAGES, msgs);
  }
}