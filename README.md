# TuDineroMueve - Documentation

## Project Structure
```
/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ExchangeModal.tsx (Logic for Quote->Identify->Confirm)
│   │   └── UIComponents.tsx
│   ├── services/
│   │   └── mockBackend.ts (Simulates DB and WebSockets)
│   ├── views/
│   │   ├── ClientDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── Landing.tsx (In App.tsx for this demo)
│   ├── types.ts (Global TS Interfaces)
│   ├── App.tsx (Main Router & Layout)
│   └── index.tsx (Entry)
└── package.json
```

## Database Schema (PostgreSQL)

### 1. CLIENTES (Users)
```sql
CREATE TABLE users (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    paypal_email VARCHAR(255),
    bank_details_json JSONB, -- Stores destination bank info
    role VARCHAR(20) DEFAULT 'CLIENT', -- CLIENT, ADMIN, OWNER
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. TRANSACCIONES (Transactions)
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    client_id UUID REFERENCES users(uuid),
    type VARCHAR(50) NOT NULL, -- 'EXCHANGE_PAYPAL', 'CRYPTO'
    amount_in DECIMAL(10, 2) NOT NULL,
    amount_out DECIMAL(10, 2) NOT NULL,
    rate_applied DECIMAL(10, 4) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', 
    -- PENDING, INVOICE_SENT, VERIFYING, PROCESSING, COMPLETED
    timer_end_at TIMESTAMP, -- If status is PROCESSING
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. CONFIGURACION_SISTEMA (System Config)
```sql
CREATE TABLE system_config (
    key VARCHAR(50) PRIMARY KEY,
    value_json JSONB,
    updated_by UUID REFERENCES users(uuid)
);
-- Example Row: key='exchange_rates', value={'usd_to_local': 0.92}
```

### 4. LOGS_AUDITORIA (Audit Logs)
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id UUID REFERENCES users(uuid),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints (Node.js Design)

### Public
- `GET /api/rates`: Get current exchange rates.
- `POST /api/auth/login`: Authenticate user.
- `POST /api/auth/register`: Create new user.

### Secure (Bearer Token)
- `POST /api/transactions`: Create a new request.
- `GET /api/transactions`: Get history (User sees own, Admin sees all).
- `PATCH /api/transactions/:id/status`: Update status (Admin only).
  - Body: `{ status: 'PROCESSING', durationMinutes: 15 }`
- `PUT /api/admin/config`: Update rates (Owner only).
