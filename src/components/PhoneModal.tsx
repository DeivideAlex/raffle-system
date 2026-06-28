import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, phone: string, email: string) => void;
}

export function PhoneModal({ isOpen, onOpenChange, onSubmit }: PhoneModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const formatPhone = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);
    
    if (raw.length <= 2) {
      return raw.replace(/(\d{0,2})/, '($1');
    } else if (raw.length <= 6) {
      return raw.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (raw.length <= 10) {
      return raw.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return raw.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, '');
    if (rawPhone.length < 11) return;
    if (!email.includes('@')) return;
    if (!name.trim()) return;
    
    onSubmit(name.trim(), rawPhone, email);
  };

  const isValida = name.trim().length >= 2 && phone.replace(/\D/g, '').length === 11 && email.includes('@');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-[#2a3a5c] shadow-2xl bg-[#111d3a]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gold-shimmer">
            Reserva de Números
          </DialogTitle>
          <DialogDescription className="text-[#8899bb] font-medium">
            Seus números ficarão reservados por <span className="text-[#f5a623] font-bold">10 minutos</span>. Informe seus dados para confirmar a reserva e prosseguir.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#8899bb]">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#8899bb]">Telefone (WhatsApp)</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handleChangePhone}
              className="text-lg bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#8899bb]">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#f5a623] to-[#e8941a] hover:from-[#e8941a] hover:to-[#d4810f] text-[#0a1128] font-bold"
            disabled={!isValida}
          >
            Continuar para Pagamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
