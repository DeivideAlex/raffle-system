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
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Meus Números
          </DialogTitle>
          <DialogDescription>
            Informe seus dados usados na hora da compra para ver suas rifas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input 
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input 
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={!isValida} className="w-full bg-purple-600 hover:bg-purple-700">
            Pesquisar Compras
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
