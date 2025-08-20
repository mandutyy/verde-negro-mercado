import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
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

      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu email para confirmar tu cuenta.",
      });
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
      className="relative flex size-full min-h-screen flex-col bg-neutral-50 justify-between"
      style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-neutral-50 p-4 pb-2 justify-between">
          <h2 className="text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12 pr-12">
            PlantSwap
          </h2>
        </div>
        
        {/* Title */}
        <h1 className="text-[#141414] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-5">
          {isSignUp ? 'Crear cuenta' : 'Welcome back'}
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
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141414] focus:outline-0 focus:ring-0 border-none bg-[#ededed] focus:border-none h-14 placeholder:text-neutral-500 p-4 text-base font-normal leading-normal"
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
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141414] focus:outline-0 focus:ring-0 border-none bg-[#ededed] focus:border-none h-14 placeholder:text-neutral-500 p-4 text-base font-normal leading-normal"
              />
            </label>
          </div>
          
          {/* Password field */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Contraseña (mínimo 6 caracteres)" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 6 : undefined}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141414] focus:outline-0 focus:ring-0 border-none bg-[#ededed] focus:border-none h-14 placeholder:text-neutral-500 p-4 pr-12 text-base font-normal leading-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </label>
          </div>
          
          {/* Forgot password - only show for login */}
          {!isSignUp && (
            <p className="text-neutral-500 text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer">
              Forgot password?
            </p>
          )}
          
          {/* Submit button */}
          <div className="flex px-4 py-3">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-black text-neutral-50 text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {loading 
                  ? (isSignUp ? 'Creando cuenta...' : 'Iniciando...') 
                  : (isSignUp ? 'Crear Cuenta' : 'Log In')
                }
              </span>
            </button>
          </div>
        </form>
        
        {/* Social login - only show for login */}
        {!isSignUp && (
          <>
            <p className="text-neutral-500 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Or log in with
            </p>
            <div className="flex justify-center">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
                <button
                  type="button"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ededed] text-[#141414] text-sm font-bold leading-normal tracking-[0.015em] grow"
                >
                  <span className="truncate">Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#ededed] text-[#141414] text-sm font-bold leading-normal tracking-[0.015em] grow"
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
        <p 
          className="text-neutral-500 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setEmail('');
            setPassword('');
            setName('');
          }}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </p>
        <div className="h-5 bg-neutral-50"></div>
      </div>
    </div>
  );
};

export default Auth;