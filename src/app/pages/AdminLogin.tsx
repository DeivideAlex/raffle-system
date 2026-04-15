import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === JSON.stringify({ authenticated: true })) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('adminAuth', JSON.stringify({ authenticated: true }));
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Senha incorreta!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm border border-[#2a3a5c] shadow-2xl bg-[#111d3a]">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-[#f5a623]/15 w-16 h-16 flex items-center justify-center rounded-full mb-2 border border-[#f5a623]/30">
            <ShieldCheck className="w-8 h-8 text-[#f5a623]" />
          </div>
          <CardTitle className="text-2xl font-black text-white">Área Restrita</CardTitle>
          <CardDescription className="text-[#8899bb]">
            Acesso exclusivo para administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#8899bb]">Senha de Acesso</Label>
              <Input 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#0a1128] border-[#2a3a5c] text-white placeholder:text-[#5a6a8a]"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#f5a623] to-[#e8941a] hover:from-[#e8941a] hover:to-[#d4810f] text-[#0a1128] font-bold h-12">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[#5a6a8a] text-sm">
        NAI Premiações &copy; 2026
      </p>
    </div>
  );
}
