import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';


export function CreateRaffle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    prizeName: '',
    prizeValue: '',
    prizeDescription: '',
    ticketPrice: '',
    totalNumbers: '100',
    prizeImage: '',
    endDate: '',
    type: 'numbers' as 'numbers' | 'animals'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, prizeImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.prizeImage) {
        toast.error('Obrigatório enviar uma imagem');
        setLoading(false);
        return;
      }

      const id = `raffle-${Date.now()}`;
      const newRaffle = {
        ...formData,
        id,
        createdAt: new Date().toISOString()
      };

      await api.saveRaffle(newRaffle);

      // Initialize tickets for this raffle in the DB
      const total = parseInt(formData.totalNumbers);
      const initialTickets = Array.from({ length: total }).map((_, i) => ({
        number: i,
        status: 'free'
      }));
      await api.updateTickets(id, initialTickets);
      
      toast.success('Rifa criada com sucesso!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao salvar rifa: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full h-16 bg-slate-900 border-b border-white/10 flex items-center px-6 justify-between text-white">
        <h1 className="font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" /> Admin Panel
        </h1>
        <Link to="/admin/dashboard">
          <Button variant="ghost" className="text-slate-300 hover:text-white">Cancelar</Button>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="icon" className="rounded-full bg-white"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h2 className="text-3xl font-black text-slate-800">Criar Nova Rifa</h2>
        </div>

        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit}>
              <div className="p-8 space-y-6">
                
                <div className="space-y-3">
                  <Label className="text-base font-bold text-slate-800">Imagem do Prêmio *</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative">
                      {formData.prizeImage ? (
                        <img src={formData.prizeImage} className="w-full h-full object-cover" alt="Preview"/>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500"><span className="font-bold">Clique para enviar</span> ou arraste</p>
                          <p className="text-xs text-slate-500">PNG, JPG ou GIF (MAX. 5MB)</p>
                        </div>
                      )}
                      <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="prizeName">Nome do Prêmio *</Label>
                    <Input id="prizeName" required value={formData.prizeName} onChange={e => setFormData({...formData, prizeName: e.target.value})} placeholder="Ex: iPhone 15 Pro Max" className="h-12"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeValue">Valor do Prêmio *</Label>
                    <Input id="prizeValue" required value={formData.prizeValue} onChange={e => setFormData({...formData, prizeValue: e.target.value})} placeholder="Ex: R$ 10.000,00" className="h-12"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="raffleType">Tipo de Rifa</Label>
                    <select 
                      id="raffleType" 
                      value={formData.type} 
                      onChange={e => {
                        const type = e.target.value as 'numbers' | 'animals';
                        setFormData({
                          ...formData, 
                          type,
                          totalNumbers: type === 'animals' ? '100' : formData.totalNumbers
                        });
                      }} 
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="numbers">Números Individuais</option>
                      <option value="animals">Grupo (Animais - Jogo do Bicho)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prizeDescription">Descrição Detalhada</Label>
                    <Input id="prizeDescription" value={formData.prizeDescription} onChange={e => setFormData({...formData, prizeDescription: e.target.value})} placeholder="Insira os detalhes e as regras" className="h-12"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice">Valor por Número (R$) *</Label>
                    <Input id="ticketPrice" required type="number" step="0.01" min="0.01" value={formData.ticketPrice} onChange={e => setFormData({...formData, ticketPrice: e.target.value})} placeholder="Ex: 5.00" className="h-12"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalNumbers">Qtd. de Números *</Label>
                    <select 
                      id="totalNumbers" 
                      value={formData.totalNumbers} 
                      disabled={formData.type === 'animals'}
                      onChange={e => setFormData({...formData, totalNumbers: e.target.value})} 
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="10">10 números</option>
                      <option value="25">25 números</option>
                      <option value="50">50 números</option>
                      <option value="100">100 números</option>
                      <option value="200">200 números</option>
                      <option value="500">500 números</option>
                      <option value="1000">1000 números</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data e Hora Fim *</Label>
                    <Input id="endDate" type="datetime-local" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="h-12"/>
                  </div>
                </div>

              </div>
              <div className="bg-slate-50 p-8 border-t border-slate-100 flex justify-end">
                <Button type="submit" className="w-full sm:w-auto h-12 px-8 bg-purple-600 hover:bg-purple-700 font-bold text-lg" disabled={loading}>
                  {loading ? 'Salvando...' : 'Criar e Gerar Link'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
