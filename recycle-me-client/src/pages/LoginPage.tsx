import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField';

type LoginType = 'pf' | 'pj';

function LoginPage() {
    const [loginType, setLoginType] = useState<LoginType>('pf');
    const [email, setEmail] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginSuccess, setLoginSuccess] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, user } = useAuth(); 

    useEffect(() => {
        if (loginSuccess && isAuthenticated && user) {
            // Pequeno timeout para garantir que o estado propagou
            const timer = setTimeout(() => {
                const origin = location.state?.from?.pathname;
                console.log("Redirecionando para:", origin || "Home");
                
                if (origin) {
                    navigate(origin, { replace: true });
                } else if (user.type === 'market') {
                    navigate('/painel-fiscal', { replace: true });
                } else {
                    navigate('/mapa', { replace: true });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loginSuccess, isAuthenticated, user, navigate, location]);

    // ... Resto do código do handleSubmit e renderização (Mantenha igual)
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoginSuccess(false);

        // Validação
        if (loginType === 'pf' && !email.trim()) return setError('Email obrigatório.');
        if (loginType === 'pj' && !cnpj.trim()) return setError('CNPJ obrigatório.');
        if (!password) return setError('Senha obrigatória.');
        
        setLoading(true);

        const bodyData = {
            type: loginType,
            password: password,
            ...(loginType === 'pf' ? { email } : { cnpj: cnpj.replace(/[^\d]/g, '') })
        };

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Falha no login');
            }

            login(data.token, data.user); 
            setLoginSuccess(true);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4">
            {/* Container igual ao RegisterPage */}
            <div className="w-full max-w-6xl h-[750px] grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

                <div className="hidden md:block relative h-full">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Mãos segurando terra e planta" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                </div>

                <div className="h-full flex flex-col px-10 py-12 relative">
                    <div className="h-[60px] shrink-0 text-center">
                        <h1 className="text-3xl font-bold text-brand-dark dark:text-white">Bem-vindo de volta!</h1>
                        <p className="text-sm text-gray-500 mt-1">Acesse sua conta Recycle_me</p>
                    </div>

                    <div className="shrink-0 w-full flex flex-col items-center mb-6 h-[80px]">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
                            <button type="button" onClick={() => setLoginType('pf')} className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${loginType === 'pf' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Pessoal</button>
                            <button type="button" onClick={() => setLoginType('pj')} className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${loginType === 'pj' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Empresa</button>
                        </div>
                    </div>

                    <div className="h-[20px] shrink-0 flex items-center justify-center mb-4">
                        {error && <p className="text-[11px] text-red-500 font-bold animate-shake bg-red-50 px-3 py-1 rounded-full">{error}</p>}
                        {loginSuccess && <p className="text-[11px] text-green-600 font-bold animate-pulse bg-green-50 px-3 py-1 rounded-full">Login realizado!</p>}
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col justify-center space-y-6">
                        <div className="w-full space-y-5">
                            {loginType === 'pf' ? (
                                <div className="animate-fadeIn"><InputField id="email" label="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope" /></div>
                            ) : (
                                <div className="animate-fadeIn"><InputField id="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-building" /></div>
                            )}
                            <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock">
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                            </InputField>
                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center text-gray-600 dark:text-gray-400 cursor-pointer hover:text-brand-green"><input type="checkbox" className="mr-2 rounded text-brand-green focus:ring-brand-green" />Lembrar de mim</label>
                                <a href="#" className="text-brand-green hover:underline font-bold">Esqueceu a senha?</a>
                            </div>
                        </div>

                        <div className="mt-auto w-full pt-6">
                            <button type="submit" disabled={loading || loginSuccess} className="w-full py-3.5 rounded-xl bg-brand-dark text-white font-bold hover:bg-black shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : (loginSuccess ? 'Redirecionando...' : 'Entrar')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                        <p className="text-xs text-gray-500">Não tem uma conta? <Link to="/cadastro" className="text-brand-green font-bold hover:underline">Cadastre-se</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;