-- 1. Tabela de Rifas
CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY, 
  "prizeName" TEXT NOT NULL,
  "prizeValue" TEXT NOT NULL,
  "prizeDescription" TEXT,
  "ticketPrice" DECIMAL(10,2) NOT NULL,
  "totalNumbers" INTEGER NOT NULL,
  "prizeImage" TEXT,
  "endDate" TIMESTAMPTZ NOT NULL,
  "winnerNumber" INTEGER,
  status TEXT DEFAULT 'active',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Números/Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "raffleId" TEXT REFERENCES raffles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'free',
  "ownerPhone" TEXT,
  "ownerEmail" TEXT,
  "reservedAt" TIMESTAMPTZ,
  UNIQUE("raffleId", number)
);

-- 3. Tabela de Compras/Pedidos
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  "raffleId" TEXT REFERENCES raffles(id) ON DELETE CASCADE,
  numbers INTEGER[] NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "purchaseDate" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Vencedores (Histórico)
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "raffleId" TEXT REFERENCES raffles(id) ON DELETE SET NULL,
  "raffleName" TEXT NOT NULL,
  "prizeValue" TEXT NOT NULL,
  "winnerNumber" INTEGER NOT NULL,
  "winnerName" TEXT NOT NULL,
  "prizeImage" TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tickets_raffle ON tickets("raffleId");
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_purchases_phone ON purchases(phone);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);

-- Desativar RLS
ALTER TABLE raffles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE winners DISABLE ROW LEVEL SECURITY;
