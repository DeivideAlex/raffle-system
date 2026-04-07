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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm border-0 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-purple-100 w-16 h-16 flex items-center justify-center rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-black">Área Restrita</CardTitle>
          <CardDescription>
            Acesso exclusivo para administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Senha de Acesso</Label>
              <Input 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-slate-400 text-sm">
        Sistema de Rifas Online &copy; 2026
      </p>
    </div>
  );
}
