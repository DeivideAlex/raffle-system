import { Trophy, CheckCircle2, Clock, CircleDot } from 'lucide-react';

interface StatusSummaryProps {
  free: number;
  reserved: number;
  paid: number;
}

export function StatusSummary({ free, reserved, paid }: StatusSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
      <div className="flex flex-col items-center bg-[#111d3a] p-3 rounded-xl border border-[#2a3a5c] shadow-sm">
        <CircleDot className="w-6 h-6 text-[#00c853] mb-1" />
        <span className="text-2xl font-bold text-white">{free}</span>
        <span className="text-xs text-[#8899bb] uppercase tracking-wider font-semibold">Livres</span>
      </div>
      
      <div className="flex flex-col items-center bg-[#111d3a] p-3 rounded-xl border border-[#2a3a5c] shadow-sm">
        <Clock className="w-6 h-6 text-[#f5a623] mb-1" />
        <span className="text-2xl font-bold text-white">{reserved}</span>
        <span className="text-xs text-[#8899bb] uppercase tracking-wider font-semibold text-center">Reservados</span>
      </div>

      <div className="flex flex-col items-center bg-[#111d3a] p-3 rounded-xl border border-[#2a3a5c] shadow-sm">
        <CheckCircle2 className="w-6 h-6 text-[#1e88e5] mb-1" />
        <span className="text-2xl font-bold text-white">{paid}</span>
        <span className="text-xs text-[#8899bb] uppercase tracking-wider font-semibold">Pagos</span>
      </div>
    </div>
  )
}
