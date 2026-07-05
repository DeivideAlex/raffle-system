-- 1. Tabela de Rifas
CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY, 
  prize_name TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  prize_description TEXT,
  ticket_price DECIMAL(10,2) NOT NULL,
  total_numbers INTEGER NOT NULL,
  prize_image TEXT,
  end_date TIMESTAMPTZ NOT NULL,
  winner_number INTEGER,
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'numbers',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Números/Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id TEXT REFERENCES raffles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'free',
  owner_phone TEXT,
  owner_email TEXT,
  reserved_at TIMESTAMPTZ,
  UNIQUE(raffle_id, number)
);

-- 3. Tabela de Compras/Pedidos
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  raffle_id TEXT REFERENCES raffles(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  name TEXT DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  purchase_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Vencedores (Histórico)
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id TEXT REFERENCES raffles(id) ON DELETE SET NULL,
  raffle_name TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  winner_number INTEGER NOT NULL,
  winner_name TEXT NOT NULL,
  prize_image TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Índices corrigidos
CREATE INDEX IF NOT EXISTS idx_tickets_raffle ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_purchases_phone ON purchases(phone);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);

-- Desativar RLS
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE winners DISABLE ROW LEVEL SECURITY;
