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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { name }
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

      if (data.session) {
        toast({
          title: "¡Cuenta creada!",
          description: "Sesión iniciada automáticamente.",
        });
        navigate('/');
      } else {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar la cuenta. Si quieres que el alta sea automática, desactiva la confirmación por email en Supabase.",
        });
      }
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

  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
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
        
        {/* Divider */}
        <div className="flex items-center gap-3 px-4 py-2 max-w-[480px] mx-auto w-full">
          <div className="flex-1 h-px bg-[#264532]" />
          <span className="text-[#96c5a9] text-sm">O continúa con</span>
          <div className="flex-1 h-px bg-[#264532]" />
        </div>

        {/* Social login buttons - always visible */}
        <div className="flex flex-col gap-3 px-4 py-3 max-w-[480px] mx-auto w-full">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#264532] text-white text-sm font-bold hover:bg-[#2d5039] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn('facebook')}
            className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-[#264532] text-white text-sm font-bold hover:bg-[#2d5039] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div>
        <div className="h-5 bg-[#122118]"></div>
      </div>
    </div>
  );
};

export default Auth;