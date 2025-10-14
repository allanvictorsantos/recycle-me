import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Algo deu errado');
      }

      // SUCESSO!
      // Apenas chamamos a função de login simples, sem passar o token
      login(); 

      navigate(from, { replace: true });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // SEU LAYOUT ORIGINAL 100% PRESERVADO
    <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border-t border-l border-gray-100 dark:border-gray-700/50 border-b border-r border-gray-300 dark:border-black/20">
        
        <div className="hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" 
            alt="Mãos a segurar um punhado de terra com uma planta a brotar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block text-2xl font-extrabold tracking-tighter text-brand-dark dark:text-white">
              ♻️ RECYCLE_ME
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">Acesse sua Conta</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Bem-vindo(a) de volta!</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-envelope text-gray-400"></i></div>
                  <input type="email" id="email" name="email" required placeholder="seu@email.com"
                    className="block w-full pl-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-lock text-gray-400"></i></div>
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password" required placeholder="Sua senha segura"
                    className="block w-full pl-10 pr-10 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand-green">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Lembrar-me</label>
                </div>
                <div className="text-sm"><a href="#" className="font-medium text-brand-green hover:underline">Esqueceu sua senha?</a></div>
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-brand-green hover:scale-105 transform transition-all duration-300 btn-glow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou entre com</span></div>
            </div>
            <div className="mt-6">
              <a href="#" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                <span className="sr-only">Entrar com Google</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM8.93 14.715c-2.43.08-4.385-1.95-4.385-4.398s1.955-4.478 4.385-4.398c1.325.045 2.51.59 3.32 1.48l-1.28 1.15c-.49-.46-1.155-.77-1.93-.77-1.46 0-2.65 1.23-2.65 2.74s1.19 2.74 2.65 2.74c1.69 0 2.22-1.1 2.335-1.66H8.93v-1.91h4.455c.065.34.1.66.1 1.025 0 2.605-1.72 4.515-4.555 4.515z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="font-medium text-brand-green hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;

