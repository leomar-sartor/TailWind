import { Button } from '../components/Button'
import { useEffect, useState } from 'react';
import { SplitScreenLayout } from '../layouts/SplitScreenLayout';
import loginImage from '@/assets/wallpaper/Professional.png'
import headerImage from '@/assets/logos/LogoHeaderFormSample.png';
import { AuthImage } from "../components/AuthImage/AuthImage";
import { useForm, SubmitHandler } from "react-hook-form"
import { Input } from '../components/Input';
import { useAuth } from '../auth/AuthContext'; // ← adiciona isso
import { User } from 'lucide-react';

type LoginInputs = {
  email: string;
  password: string;
}

export function LoginPage() {

  const { login } = useAuth(); // ← hook de auth
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadedLogo, setLoadedLogo] = useState(false);
  
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');

    return () => {
    };
  }, []);

  const {
    register,
    handleSubmit,
    //watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>();

  // const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  // onSubmit agora chama o backend de verdade
  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setAuthError(null);
    try {
      await login({ email: data.email, password: data.password });
      // navegação acontece dentro do login() via useNavigate
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Credenciais inválidas.');
    }
  };

  return (
    <SplitScreenLayout
      left={
        <div className="flex flex-col min-h-screen transition-all duration-500 ease-in-out">

          {/* Header */}
          <div className='flex justify-center pt-8'>
            <img
              src={headerImage}
              alt="Logo"
              loading="eager"
              onLoad={() => setLoadedLogo(true)}
              className={`w-108 h-24 object-cover transition-opacity duration-300 ${loadedLogo ? "opacity-100" : "opacity-0"
                }`}
            />
          </div>
          {/* /Header */}

          {/* Form */}
          <div className='flex-1 flex justify-center items-center px-8'>
            <form
              className='space-y-4 w-full max-w-md'
              onSubmit={handleSubmit(onSubmit)}>

              <p className="text-link text-center text-2xl mb-1">
                Bem-vindo ao ARP! 👋
              </p>
              <p className="text-center text-md mb-12">
                Para acessar, preencha os dados abaixo
              </p>

              {/* E-mail */}
              <Input
                icon={<User size={18} />}
                name="email"
                placeholder="E-mail"
                registration={register("email", {
                  required: "O e-mail é obrigatório."
                })}
                error={errors.email}
              />

              {/* Senha */}
              <Input
                name="password"
                placeholder="Digite a senha"
                type={"password"}
                registration={register('password', {
                  required: 'Senha obrigatória',
                })}
                error={errors.password}
              />

              <div className="flex mx-auto">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className='w-full rounded-2xl my-4 p-4 justify-center'
                  onClick={() => console.log("Acessar Portal", new Date())}
                >
                  Entrar
                  {/* {isSubmitting ? 'Entrando...' : 'Entrar'} */}
                </Button>
              </div>

              {authError && (
                <p className="text-red-500 text-sm text-center">{authError}</p>
              )}

              <div className="flex mx-auto">
                <button
                  type="submit"
                  className="w-full text-link hover:text-link-hover"
                  onClick={() => console.log("Esqueci minha senha", new Date())}
                >
                  Esqueci minha senha
                </button>
              </div>

            </form>
          </div>
          {/* /Form */}

          {/* Footer */}
          <p className='pb-6 px-8 text-center text-xs'>
            © Prospect 2025 - Análise de Riscos Piscossociais
            <br />
            <a href='#' className='underline'>Política de Privacidade</a>
            {' '}e{' '}
            <a href='#' className='underline'>Dúvidas</a>
          </p>
          {/* /Footer */}

        </div>
      }
      right={
        <AuthImage src={loginImage} />
      }
    />
  )
}