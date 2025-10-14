import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

// Simple password schema - only requires one uppercase letter
const passwordSchema = z.string()
  .min(6, 'La contraseña debe tener al menos 6 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula');

const validatePassword = (pwd: string) => {
  const result = passwordSchema.safeParse(pwd);
  if (!result.success) {
    return result.error.errors[0]?.message ?? 'Contraseña inválida';
  }
  return null;
};

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side strong password validation for signup
    if (isSignUp) {
      const pwdError = validatePassword(password);
      if (pwdError) {
        toast({
          title: 'Contraseña débil',
          description: pwdError,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name
          }
        }
      });

      if (error) throw error;

      // Check if user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
          title: "Usuario ya existe",
          description: "Esta cuenta ya está registrada. Por favor, inicia sesión.",
          variant: "destructive",
        });
        setIsSignUp(false); // Switch to login view
        return;
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Iniciando sesión automáticamente...",
      });
      
      // Auto login after successful signup
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#122118] justify-between"
      style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#122118] p-4 pb-2 justify-between">
          <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">
            Plantify
          </h2>
        </div>
        
        {/* Title */}
        <h1 className="text-white text-[28px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-8">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h1>
        
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {/* Name field - only show for signup */}
          {isSignUp && (
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#264532] focus:border-none h-14 placeholder:text-[#96c5a9] p-4 text-base font-normal leading-normal"
                />
              </label>
            </div>
          )}
          
          {/* Email field */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#264532] focus:border-none h-14 placeholder:text-[#96c5a9] p-4 text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          {/* Password field */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Contraseña (mín. 6 caracteres, 1 mayúscula)" : "Contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#264532] focus:border-none h-14 placeholder:text-[#96c5a9] p-4 pr-12 text-base font-normal leading-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#96c5a9] hover:text-white focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>
          </div>
          
          {/* Forgot password - only show for login */}
          {!isSignUp && (
            <p className="text-[#96c5a9] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer">
              ¿Olvidaste tu contraseña?
            </p>
          )}
          
          {/* Submit button */}
          <div className="flex px-4 py-1">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#38e07b] text-[#122118] text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                 {loading 
                   ? (isSignUp ? 'Creando cuenta...' : 'Iniciando...') 
                   : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')
                 }
              </span>
            </button>
          </div>
        </form>
        
        {/* Toggle between sign up and sign in */}
        <p 
          className="text-[#96c5a9] text-sm font-normal leading-normal py-3 px-4 text-center underline cursor-pointer"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
            setName('');
          }}
        >
          {isSignUp ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Registrarse'}
        </p>
        
        {/* Social login - only show for login */}
        {!isSignUp && (
          <>
            <p className="text-[#96c5a9] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              O inicia sesión con
            </p>
            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#264532] text-white text-sm font-bold leading-normal tracking-[0.015em] grow"
                >
                  <span className="truncate">Google</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div>
        <div className="h-5 bg-[#122118]"></div>
      </div>
    </div>
  );
};

export default Auth;