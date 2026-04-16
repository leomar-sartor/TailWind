type DashboardFooterProps = {
  collapsed: boolean;
};

export function DashboardFooter({ collapsed }: DashboardFooterProps) {
  return (
    <footer className={`border-t dashboard-border dashboard-footer py-4 text-sm pr-4 ${collapsed ? 'pl-20' : 'pl-72'}`}>
      <div className="px-4 mx-auto flex max-w-7xl flex-col gap-3 text-center">
        <div>
          <span>© {new Date().getFullYear()} Functional. Todos os direitos reservados.</span>
          <span className="block dashboard-text-muted">Portal administrativo responsivo com Tailwind CSS.</span>
        </div>
      </div>
    </footer>
  );
}
