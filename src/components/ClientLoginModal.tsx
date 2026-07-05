import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ClientLoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (phone: string, email: string) => void;
}

export function ClientLoginModal({ isOpen, onOpenChange, onLogin }: ClientLoginModalProps) {
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

  const isValida = phone.replace(/\D/g, '').length === 11 && email.includes('@');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValida) {
      onLogin(phone.replace(/\D/g, ''), email);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#111d3a] border border-[#2a3a5c] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Meus Números
          </DialogTitle>
          <DialogDescription className="text-[#8899bb]">
            Informe o telefone e e-mail usados na hora da compra para ver suas rifas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-[#8899bb]">Telefone (WhatsApp)</Label>
            <Input 
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
              className="bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#8899bb]">E-mail</Label>
            <Input 
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
            />
          </div>

          <Button type="submit" disabled={!isValida} className="w-full bg-gradient-to-r from-[#f5a623] to-[#e8941a] hover:from-[#e8941a] hover:to-[#d4810f] text-[#0a1128] font-bold">
            Pesquisar Compras
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
