import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Acesso não autorizado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Você não tem permissão para acessar esta página.
      </p>
      <Button type="button" onClick={() => navigate('/dashboard', { replace: true })}>
        Voltar ao dashboard
      </Button>
    </div>
  );
}
