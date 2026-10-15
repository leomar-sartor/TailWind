import { create } from 'zustand';

type ActiveContextState = {
  tenantId: string | null;
  companyId: string | null;
  version: number;
  setActiveContext: (tenantId: string | null, companyId: string | null) => void;
  clearActiveContext: () => void;
};

const STORAGE_KEY = 'arp.activeContext';

function readStoredContext(): Pick<ActiveContextState, 'tenantId' | 'companyId'> {
  if (typeof window === 'undefined') return { tenantId: null, companyId: null };

  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (!value) return { tenantId: null, companyId: null };

    const parsed = JSON.parse(value) as { tenantId?: unknown; companyId?: unknown };
    return {
      tenantId: typeof parsed.tenantId === 'string' ? parsed.tenantId : null,
      companyId: typeof parsed.companyId === 'string' ? parsed.companyId : null,
    };
  } catch {
    return { tenantId: null, companyId: null };
  }
}

export const useActiveContextStore = create<ActiveContextState>((set, get) => ({
  ...readStoredContext(),
  version: 0,
  setActiveContext: (tenantId, companyId) => {
    const current = get();
    if (current.tenantId === tenantId && current.companyId === companyId) return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tenantId, companyId }));
    }

    set((state) => ({
      tenantId,
      companyId,
      version: state.version + 1,
    }));
  },
  clearActiveContext: () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    set((state) => ({ tenantId: null, companyId: null, version: state.version + 1 }));
  },
}));

export const selectActiveTenantId = (state: ActiveContextState) => state.tenantId;
export const selectActiveCompanyId = (state: ActiveContextState) => state.companyId;
