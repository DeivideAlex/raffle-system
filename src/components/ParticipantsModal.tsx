import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Purchase } from '@/app/types';
import { Users, CheckCircle2, Clock, DollarSign, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ParticipantsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  raffleId: string;
  raffleName: string;
}

export function ParticipantsModal({ isOpen, onOpenChange, raffleId, raffleName }: ParticipantsModalProps) {
  const [participants, setParticipants] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'paid' | 'all'>('paid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen || !raffleId) return;
    loadParticipants();
  }, [isOpen, raffleId, filter]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const data = await api.getParticipants(raffleId, filter);
      setParticipants(data);
    } catch (e) {
      console.error('Erro ao carregar participantes:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.numbers.some(n => String(n).includes(q))
    );
  });

  const paidTotal = participants
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.totalAmount, 0);

  const paidCount = participants.filter(p => p.status === 'paid').length;
  const pendingCount = participants.filter(p => p.status === 'pending').length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col bg-[#0f1a35] border border-[#2a3a5c] shadow-2xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-[#2a3a5c] shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#f5a623]" />
                Participantes
              </DialogTitle>
              <p className="text-sm text-[#8899bb] mt-1 truncate max-w-md">{raffleName}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-[#5a6a8a] hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-[#111d3a] border border-[#2a3a5c] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#00c853]" />
                <span className="text-xs font-semibold text-[#8899bb] uppercase">Pagos</span>
              </div>
              <p className="text-2xl font-black text-[#00c853]">{paidCount}</p>
            </div>
            <div className="bg-[#111d3a] border border-[#2a3a5c] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-[#f5a623]" />
                <span className="text-xs font-semibold text-[#8899bb] uppercase">Pendentes</span>
              </div>
              <p className="text-2xl font-black text-[#f5a623]">{pendingCount}</p>
            </div>
            <div className="bg-[#111d3a] border border-[#2a3a5c] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-[#1e88e5]" />
                <span className="text-xs font-semibold text-[#8899bb] uppercase">Arrecadado</span>
              </div>
              <p className="text-lg font-black text-white">R$ {paidTotal.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>

          {/* Filtros e busca */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a8a]" />
              <Input
                placeholder="Buscar por nome, email, telefone ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#111d3a] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a] h-9"
              />
            </div>
            <Button
              size="sm"
              variant={filter === 'paid' ? 'default' : 'outline'}
              onClick={() => setFilter('paid')}
              className={filter === 'paid'
                ? 'bg-[#00c853]/20 text-[#00c853] border border-[#00c853]/40 hover:bg-[#00c853]/30'
                : 'border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]'
              }
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pagos
            </Button>
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all'
                ? 'bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/40 hover:bg-[#f5a623]/30'
                : 'border-[#2a3a5c] text-[#8899bb] hover:text-white hover:bg-[#1a2744]'
              }
            >
              <Users className="w-3.5 h-3.5 mr-1" /> Todos
            </Button>
          </div>
        </DialogHeader>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-[#2a3a5c] mx-auto mb-3" />
              <p className="text-[#5a6a8a]">
                {search ? 'Nenhum resultado encontrado.' : 'Nenhum participante encontrado.'}
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className={`rounded-xl border p-4 transition-all ${
                  p.status === 'paid'
                    ? 'bg-[#111d3a] border-[#00c853]/20 hover:border-[#00c853]/40'
                    : 'bg-[#111d3a] border-[#2a3a5c] hover:border-[#f5a623]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Nome */}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-white truncate">
                        {p.name || <span className="text-[#5a6a8a] italic font-normal">Sem nome</span>}
                      </p>
                      {p.status === 'paid' ? (
                        <Badge className="shrink-0 bg-[#00c853]/15 text-[#00c853] border border-[#00c853]/30 text-[10px] px-2 py-0">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> PAGO
                        </Badge>
                      ) : (
                        <Badge className="shrink-0 bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 text-[10px] px-2 py-0">
                          <Clock className="w-2.5 h-2.5 mr-1" /> PENDENTE
                        </Badge>
                      )}
                    </div>
                    {/* Contatos */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-[#8899bb] mb-2">
                      <span>📱 {p.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</span>
                      <span>✉️ {p.email}</span>
                    </div>
                    {/* Números */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.numbers.map(n => (
                        <span
                          key={n}
                          className="w-9 h-9 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 text-xs font-bold flex items-center justify-center"
                        >
                          {String(n).padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Valor */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-white">
                      R$ {p.totalAmount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-[#5a6a8a]">
                      {new Date(p.purchaseDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
