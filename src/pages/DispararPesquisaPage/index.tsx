import { useState } from 'react';
import { useDisparoStore } from '../../store/disparoStore';
import { StepSelecionarPesquisa } from './StepSelecionarPesquisa';
import { StepSelecionarDestinatarios } from './StepSelecionarDestinatarios';
import { StepConfirmar } from './StepConfirmar';
import { CheckCircle, ChevronRight } from 'lucide-react';

type Step = 1 | 2 | 3;

const STEPS = [
  { id: 1, label: 'Pesquisa' },
  { id: 2, label: 'Destinatários' },
  { id: 3, label: 'Confirmar' },
];

export function DispararPesquisaPage() {

  const [step, setStep] = useState<Step>(1);
  const pesquisaId = useDisparoStore((s) => s.pesquisaId);
  const colaboradoresSelecionados = useDisparoStore((s) => s.colaboradoresSelecionados);

  const canGoToStep2 = !!pesquisaId;
  const canGoToStep3 = canGoToStep2 && colaboradoresSelecionados.length > 0;

  const handleNext = () => setStep((s) => Math.min(s + 1, 3) as Step);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-1 px-4">
        <h2 className="text-xl font-semibold text-[#2B2C40]">Disparar pesquisa</h2>
        <p className="text-sm dashboard-text-muted">
          Selecione a pesquisa, os destinatários e confirme o envio.
        </p>
      </div>

      {/* Stepper */}
      <div className="dashboard-card rounded-[20px] border shadow-sm px-6 py-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;

            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (s.id === 2 && !canGoToStep2) return;
                    if (s.id === 3 && !canGoToStep3) return;
                    setStep(s.id as Step);
                  }}
                  className="flex items-center gap-2 group"
                >
                  <span className={[
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all',
                    isActive ? 'bg-[#696CFF] text-white shadow-md' :
                    isDone ? 'bg-[#71DD37] text-white' :
                    'bg-[#E4E6E8] text-[#8592A3]',
                  ].join(' ')}>
                    {isDone ? <CheckCircle className="h-4 w-4" /> : s.id}
                  </span>
                  <span className={[
                    'text-sm font-medium transition-colors hidden sm:block',
                    isActive ? 'text-[#696CFF]' : isDone ? 'text-[#71DD37]' : 'text-[#8592A3]',
                  ].join(' ')}>
                    {s.label}
                  </span>
                </button>

                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-[#C4C8CC] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {step === 1 && <StepSelecionarPesquisa onNext={handleNext} />}
      {step === 2 && <StepSelecionarDestinatarios onNext={handleNext} onBack={handleBack} />}
      {step === 3 && <StepConfirmar onBack={handleBack} onSuccess={() => setStep(1)} />}
    </div>
  );
}