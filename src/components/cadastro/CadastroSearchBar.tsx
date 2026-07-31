type CadastroSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
};

/**
 * Search card used on cadastro list pages.
 */
export function CadastroSearchBar({
  value,
  onChange,
  hint = 'Pesquise em todas as colunas.',
  placeholder = 'Pesquisar...',
}: CadastroSearchBarProps) {
  return (
    <section className="dashboard-card rounded-[28px] border p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#2B2C40]">Buscar</h3>
          <p className="mt-1 text-sm dashboard-text-muted">{hint}</p>
        </div>
        <div className="w-full sm:w-80">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-3xl border border-slate-200 px-4 py-2"
          />
        </div>
      </div>
    </section>
  );
}
