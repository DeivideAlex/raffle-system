import { Link } from 'react-router';
import { Button } from './ui/button';
import { Trophy, ShieldCheck, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { MyNumbersModal } from './MyNumbersModal';

export function TopBar({ isAdmin = false, onWinnersClick, hideAdmin = false }: { isAdmin?: boolean, onWinnersClick?: () => void, hideAdmin?: boolean }) {
  const [isMyNumbersOpen, setIsMyNumbersOpen] = useState(false);

  return (
    <div className="w-full h-16 border-b border-[#2a3a5c]/50 bg-[#0a1128]/90 backdrop-blur-md flex items-center px-4 md:px-8 justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
        <span className="gold-shimmer font-extrabold text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>NAI</span>
        <span className="text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Premiações</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          className="text-[#f5a623] hover:text-[#ffd700] hover:bg-[#f5a623]/10" 
          onClick={() => setIsMyNumbersOpen(true)}
        >
          <ReceiptText className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">Meus Números</span>
        </Button>

        {onWinnersClick && (
          <Button variant="ghost" className="text-[#f5a623] hover:text-[#ffd700] hover:bg-[#f5a623]/10" onClick={onWinnersClick}>
            <Trophy className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Ganhadores</span>
          </Button>
        )}
        
        {!hideAdmin && (isAdmin ? (
          <Link to="/admin/dashboard">
            <Button className="font-semibold shadow-sm bg-[#f5a623] hover:bg-[#e8941a] text-[#0a1128]">
              <ShieldCheck className="w-4 h-4 mr-2" /> Painel
            </Button>
          </Link>
        ) : (
          <Link to="/admin">
            <Button className="font-semibold shadow-sm bg-[#1a2744] hover:bg-[#2a3a5c] text-[#f5a623] border border-[#f5a623]/30">
              Entrar
            </Button>
          </Link>
        ))}
      </div>

      <MyNumbersModal isOpen={isMyNumbersOpen} onOpenChange={setIsMyNumbersOpen} />
    </div>
  )
}
