import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { AppRouter } from './router/AppRouter';
import { ThemeInitializer } from './components/ThemeInitializer';

createRoot(document.getElementById('root')!).render(
  <>
    <ThemeInitializer />
    <AppRouter />
    <ToastContainer
      position="top-center"
      newestOnTop
      autoClose={4000}
      closeOnClick={false}
      pauseOnHover
      theme="colored"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
      toastClassName="bg-white border border-slate-200 shadow-2xl rounded-3xl dark:bg-[var(--color-surface)] dark:border-[var(--color-border)]"
      bodyClassName="px-4 py-3 text-slate-900 dark:text-[var(--color-text)]"
    />
  </>
)
