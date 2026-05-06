import { AlertTriangle } from 'lucide-react';
import headerImage from '@/assets/logos/LogoHeaderFormSample.png';

interface SurveyInvalidProps {
  message: string;
}

export function SurveyInvalid({ message }: SurveyInvalidProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <img src={headerImage} alt="Logo" className="h-12 object-contain mb-10 opacity-80" />

      <div className="dashboard-card rounded-[24px] border shadow-xl p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-rose-50 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-rose-400" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[#2B2C40] mb-3">
          Link inválido
        </h1>

        <p className="text-sm text-[#6C7287] leading-relaxed">
          {message}
        </p>

        <div className="mt-8 px-4 py-3 rounded-xl bg-[#F4F6FA] text-xs text-[#8592A3]">
          Se o problema persistir, entre em contato com o responsável pela pesquisa.
        </div>
      </div>

      <p className="mt-8 text-xs text-[#8592A3]">
        © Prospect 2025 — Análise de Riscos Psicossociais
      </p>
    </div>
  );
}