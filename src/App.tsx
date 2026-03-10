import './App.css'
import { Button } from './components/Button'
import { useEffect, useState } from 'react';
import { SplitScreenLayout } from './layouts/SplitScreenLayout';
import loginImage from '@/assets/wallpaper/Professional.png'
import headerImage from '@/assets/logos/LogoHeaderFormSample.png';
import { useForm, SubmitHandler } from "react-hook-form"

type AvailableThemes = 'dark' | 'light';

type Inputs = {
  example: string
  exampleRequired: string
}

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  return (
    //   <a 
    //     aria-label='Trocar Tema'
    //     title='Trocar Tema'
    //     onClick={handleThemeChange}>
    //     Trocar Tema
    //   </a>

    //   <Button  onClick={() => console.log("Two", new Date())}>
    //     Botão Two
    //   </Button>

    <SplitScreenLayout
      left={
        <div className="flex flex-col justify-between space-y-2 min-w-100 sm:min-w-113 xl:min-w-100 2xl:min-w-113 transition-all duration-500 ease-in-out">

          {/* Header */}
          <div className='pt-4'>
            <img
              src={headerImage}
              alt="Logo"
              className="w-full h-24 object-cover "
            />
          </div>
          {/* /Header */}

          {/* Form */}
          <div className=''>
            <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>

              <input className="flex w-full h-14 rounded-2xl border p-4" name="user" placeholder="user" />

              <input className="flex w-full h-14 rounded-2xl border p-4" name="password" placeholder="senha" />

              <div className="flex mx-auto">
                <Button
                  type="submit"
                  className='w-full rounded-2xl border my-4 p-4 justify-center'
                  onClick={() => console.log("Acessar Portal", new Date())}
                >
                  Acessar Portal
                </Button>
              </div>

              <div className="flex mx-auto">
                <button type="button" className="w-full text-link hover:text-link-hover"
                  onClick={() => console.log("Esqueci minha senha", new Date())}
                >
                  Esqueci minha senha
                </button>
              </div>

            </form>
          </div>
          {/* /Form */}

          {/* Footer */}
          <div className=''>
            <p className='text-center text-xs space-y-1'>
              © Prospect 2025 - Analise de Riscos Piscosociais
              <br />
              <a href='#' className='underline'>Política de Privacidade</a>
              {' '}e{' '}
              <a href='#' className='underline'>Dúvidas</a>
            </p>
          </div>
          {/* /Footer */}

        </div>
      }
      right={
        <img src={loginImage} alt="Login" className="w-full h-full object-cover" />
      }
    />
  )
}