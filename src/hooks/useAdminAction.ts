import { useState } from 'react';
import { toast } from 'react-toastify';
import { checkAccessMutation } from '../pages/AccessManagementPage';
import { getGraphQLErrorMessage } from '../utils/confirmToast';

export function useAdminAction(refresh: () => Promise<unknown>) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setFailure(null);
    try {
      checkAccessMutation(await action());
      await refresh();
      toast.success('Alteração salva com sucesso.');
      return true;
    } catch (error) {
      const message = getGraphQLErrorMessage(error) ?? 'Não foi possível concluir a alteração.';
      setFailure(message); toast.error(message);
      return false;
    } finally { setBusy(false); }
  }
  return { busy, failure, run };
}
