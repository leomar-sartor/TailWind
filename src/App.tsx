import './App.css'
import { Button } from './components/Button'
import { useEffect, useState } from 'react';
import { SplitScreenLayout } from './layouts/SplitScreenLayout';
import loginImage from '@/assets/wallpaper/Professional.png'
import headerImage from '@/assets/logos/LogoHeaderFormSample.png';
import eyeOpenIcon from "@/assets/icons/eye.svg";
import eyeCloseIcon from "@/assets/icons/eye-slash.svg";

import { useForm, SubmitHandler } from "react-hook-form"
import { Input } from './components/Input';

type AvailableThemes = 'dark' | 'light';

type Inputs = {
  example: string
  exampleRequired: string
}

export function App() {

  const [theme, setTheme] = useState<AvailableThemes>('dark');
  const [showPassword, setShowPassword] = useState(false);

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

  const toggleShowPasswordButton = (): void => {
    setShowPassword(prev => !prev);
  }

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

              <p className="text-link text-center text-2xl mb-1">
                Bem-vindo ao ARP! 👋
              </p>
              <p className="text-center text-md mb-12">
                Para acessar, preencha os dados abaixo
              </p>


              <Input name="user" placeholder="Nome de usuário" />

              <div className="relative">
                <Input name="password" placeholder="Digite a senha"
                  type={showPassword ? "text" : "password"} />
                <button
                  type="button"
                  onClick={toggleShowPasswordButton}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center" >
                  <img
                    src={showPassword ? eyeCloseIcon : eyeOpenIcon}
                    alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  />
                </button>
              </div>

              <div className="flex mx-auto">
                <Button
                  type="submit"
                  className='w-full rounded-2xl border my-4 p-4 justify-center'
                  onClick={() => console.log("Acessar Portal", new Date())}
                >
                  Entrar
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