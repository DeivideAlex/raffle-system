import { Share2, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface PrizeHeaderProps {
  name: string;
  value: string;
  description: string;
  ticketPrice: string;
  image: string;
  endDate: string;
  type?: 'numbers' | 'animals';
}

export function PrizeHeader({ name, value, description, ticketPrice, image, endDate, type }: PrizeHeaderProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência!');
  };

  const isEnded = new Date(endDate) < new Date();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-white/40">
      <div className="w-full h-48 sm:h-64 md:h-80 relative bg-slate-100">
        <img 
          src={image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop'} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {isEnded && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white text-3xl font-black uppercase tracking-widest border-4 border-white px-6 py-2 rounded-xl transform -rotate-12">
              Finalizada
            </span>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 relative">
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute -top-6 right-6 md:right-8 rounded-full h-12 w-12 shadow-lg hover:scale-105 transition-transform"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex flex-row items-center bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            <Tag className="w-3 h-3 mr-1" />
            {type === 'animals' ? 'Por Grupo' : 'Por Número'}: R$ {parseFloat(ticketPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-2 leading-tight">
          {name}
        </h1>
        
        <p className="text-lg font-bold text-green-600 mb-4">
          Valor do Prêmio: {value.includes('R$') ? value : `R$ ${value}`}
        </p>

        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          {description}
        </p>
      </div>
    </div>
  )
}
