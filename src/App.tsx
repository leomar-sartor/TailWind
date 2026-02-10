import './App.css'
import { Button } from './components/Button'
import { useEffect, useState } from 'react';

type AvailableThemes = 'dark' | 'light';

export function App() {

  const [theme, setTheme] = useState<AvailableThemes>('dark');

  function handleThemeChange(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    event.preventDefault();

    setTheme(prevTheme => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      return nextTheme;
    });
  }

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');
    
    return () => {
    };
    
  }, [theme]);

  return (
    <div className="h-screen bg-funcional text-foreground flex items-center justify-center">

      <Button onClick={() => console.log("One", new Date())}>
        Botão One
      </Button>

      <a 
        aria-label='Trocar Tema'
        title='Trocar Tema'
        onClick={handleThemeChange}>
        Trocar Tema
      </a>

      <Button  onClick={() => console.log("Two", new Date())}>
        Botão Two
      </Button>

    </div>
  )
}