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
  onSubmit: (phone: string, email: string) => void;
}

export function PhoneModal({ isOpen, onOpenChange, onSubmit }: PhoneModalProps) {
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
    
    onSubmit(rawPhone, email);
  };

  const isValida = phone.replace(/\D/g, '').length === 11 && email.includes('@');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Vamos reservar seus números!
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Informe seus dados corretamente. Eles serão usados para identificar seus números e entrar em contato caso você ganhe.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handleChangePhone}
              className="text-lg bg-slate-50 border-slate-200"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg bg-slate-50 border-slate-200"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
            disabled={!isValida}
          >
            Continuar para Pagamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
