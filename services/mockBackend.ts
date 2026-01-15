import { Transaction, User, SystemConfig, TransactionStatus, CostGroup, ConfigProfile, Coupon, ContactMessage } from '../types';

const STORAGE_KEYS = {
  USERS: 'tdm_users_v2',
  TRANSACTIONS: 'tdm_transactions_v2',
  CONFIG: 'tdm_config_v13',
  MESSAGES: 'tdm_messages'
};

const DEFAULT_CONFIG: SystemConfig = {
  notices: "Horario de atención: 8:00 AM - 6:00 PM EST",
  paypalExternalFee: { pct: 5.4, fixed: 0.30 },
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
    rates: {
      strategy: 'FIXED',
      baseP2P: 45.50,
      manualRate: 40.00,
      profitStrategy: 'GLOBAL',
      globalProfit: { mode: 'PCT_ONLY', pct: 15, fixed: 0 }
    },
    costs: [
      {
        id: 'group_bank',
        label: 'Deducciones Bancarias (Recepción)',
        items: [
          { id: 'c1', label: 'Comisión Recepción Banco', type: 'PCT', category: 'DEDUCTIVE', value: 1.5, enabled: true, isClientChargeable: true },
        ]
      },
      {
        id: 'group_service',
        label: 'Servicios Administrativos',
        items: [
           { id: 'c2', label: 'Gastos Operativos', type: 'FIXED', category: 'ADDITIVE', value: 0.50, enabled: true, isClientChargeable: true }
        ]
      }
    ],
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
    if (!config.logistics.currencies[0].secondaryRate) {
        return DEFAULT_CONFIG;
    }
    // Ensure socialLinks exist in legacy configs
    if (!config.design.socialLinks) {
        config.design.socialLinks = DEFAULT_CONFIG.design.socialLinks;
    }
    // Ensure amountRanges exist in legacy configs
    config.logistics.currencies.forEach(c => {
        if (!c.dynamicSetting.amountRanges) {
            c.dynamicSetting.amountRanges = [];
        }
    });
    return config;
  }

  static updateConfig(newConfig: Partial<SystemConfig>): SystemConfig {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    setStorage(STORAGE_KEYS.CONFIG, updated);
    return updated;
  }

  // --- RATES & QUOTES ---
  static getClientRate(currencyCode: string, amount: number = 0): number {
    const config = this.getConfig();
    const currency = config.logistics.currencies.find(c => c.code === currencyCode);
    if (!currency) return 0;

    if (currency.rateMode === 'MANUAL') {
        return currency.manualRate; // Used as "Deductiva" for calculations
    } else {
        // Dynamic Fallback
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive) || { value: 0 };
        const refValue = activeRef.value;
        const profit = currency.dynamicSetting.profitRule;
        let margin = 0;
        
        // --- PROFIT CALCULATION LOGIC ---
        // 'PCT_ONLY': Margin is a percentage of the reference value (e.g. 10% of 50 = 5)
        // 'FIXED_ONLY': Margin is a fixed value deducted from the rate (e.g. 50 - 5 = 45).
        
        if (profit.mode === 'PCT_ONLY' || profit.mode === 'MIXED') {
            let pct = profit.pct;
            
            // Dynamic Amount Ranges Logic
            if (currency.dynamicSetting.amountRanges && amount > 0) {
                const range = currency.dynamicSetting.amountRanges.find(r => 
                    r.enabled && 
                    amount >= r.minAmount && 
                    (r.maxAmount === 0 || amount <= r.maxAmount)
                );
                if (range) {
                    // Adjustment improves the rate for the client, so it REDUCES the profit margin
                    pct = Math.max(0, pct - range.adjustmentPct);
                }
            }
            
            margin += refValue * (pct / 100);
        }
        
        if (profit.mode === 'FIXED_ONLY' || profit.mode === 'MIXED') margin += profit.fixed;
        
        return Math.max(0, refValue - margin);
    }
  }

  static calculateQuote(amountGross: number, currencyCode: string, profileId?: string, couponCode?: string) {
    const config = this.getConfig();
    
    // 1. PayPal Fee (External)
    const ppFeePct = config.paypalExternalFee.pct / 100;
    const ppFeeFixed = config.paypalExternalFee.fixed;
    const ppFee = (amountGross * ppFeePct) + ppFeeFixed;
    const netPaypal = amountGross - ppFee;

    // 2. Internal Costs Loop
    let opsDeductions = 0; // "DEDUCTIVE" (Client Chargeable) -> Costs that reduce the money arriving at the "Internal Receipt"
    let serviceFee = 0;    // "ADDITIVE" -> Costs that are internal profit margins/overhead
    let adminAbsorbedCosts = 0; // "DEDUCTIVE" (Admin Chargeable) -> Costs paid by admin, not client

    config.logistics.costs.forEach(group => {
        group.items.forEach(item => {
            if(item.enabled) {
                let val = 0;
                if(item.type === 'PCT') val = netPaypal * (item.value / 100);
                else val = item.value;

                if (item.category === 'ADDITIVE') {
                    serviceFee += val; 
                } else {
                    // DEDUCTIVE LOGIC SPLIT
                    // If isClientChargeable is undefined (legacy), assume true.
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

    // --- KEY LOGIC UPDATE FOR ADMIN METRICS ---
    
    // Funds available for CLIENT calculation (Only Client Deductions removed)
    const clientBasis = netPaypal - opsDeductions;
    const baseForExchange = Math.max(0, clientBasis - serviceFee);

    // Funds available for ADMIN (Net Internal Receipt)
    // Admin request: "Non-chargeable costs affect my internal receipt because I assume them".
    const netInternalReceipt = netPaypal - opsDeductions - adminAbsorbedCosts;
    
    const currency = config.logistics.currencies.find(c => c.code === currencyCode);
    const rate = this.getClientRate(currencyCode, amountGross); 
    
    let finalAmount = baseForExchange * rate;

    let bcvEquivalent = 0;
    // Market Rate Identification for Profit Calculation (Arbitrage)
    let marketReferenceRate = 0; 

    if (currencyCode === 'VES' && currency) {
        // Determine the "Real Market Rate" (The rate the admin sells USD for)
        const activeRef = currency.dynamicSetting.references.find(r => r.isActive);
        marketReferenceRate = activeRef ? activeRef.value : (currency.manualRate * 1.05); // Fallback estimate if no reference active

        if (currency.rateMode === 'MANUAL' && currency.secondaryRate) {
            bcvEquivalent = finalAmount / currency.secondaryRate;
        } else if (currency.rateMode === 'DYNAMIC') {
            const refRef = currency.dynamicSetting.references.find(r => r.isReferential);
            if (refRef) {
                bcvEquivalent = finalAmount / refRef.value;
            }
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
    
    // Logic: Money Held (Real Net Receipt) - Cost to Cover Payment
    const moneyHeld = netInternalReceipt; 

    if (currencyCode === 'VES' && marketReferenceRate > 0) {
        // ARBITRAGE LOGIC FOR VES:
        const costToCoverInUSD = finalAmount / marketReferenceRate;
        profit = moneyHeld - costToCoverInUSD;
    } else {
        // STANDARD LOGIC (USDT/Other):
        profit = moneyHeld - (finalAmount / (rate || 1));
    }

    return {
        gross: amountGross,
        ppFee,
        netPaypal,
        opsDeductions, 
        adminAbsorbedCosts, 
        netInternalReceipt, 
        serviceFee,   
        baseForExchange,
        rate,
        finalAmount,
        bcvEquivalent,
        appliedCoupon,
        marketReferenceRate, // Returned for UI if needed
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