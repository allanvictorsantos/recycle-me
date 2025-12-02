// Salve este arquivo como: src/pages/LoginPage.tsx

import { useState, useEffect } from 'react'; // --- MUDANÇA: Importar useEffect ---
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField'; // Reutilizando nosso componente!
import React from 'react'; // Import React

type LoginType = 'pf' | 'pj';

function LoginPage() {
    // Estados para controle do formulário
    const [loginType, setLoginType] = useState<LoginType>('pf');
    const [email, setEmail] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Estados para feedback do usuário
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // --- NOVO ESTADO: Controla se o login teve sucesso para disparar a navegação ---
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Hooks
    const navigate = useNavigate();
    const location = useLocation();
    // --- MUDANÇA: Pedir também 'isAuthenticated' ---
    const { login, isAuthenticated } = useAuth();

    // Lógica de redirecionamento (Padrão: "/")
    const from = location.state?.from?.pathname || "/";

    // --- NOVO useEffect: Observa a mudança de estado ---
    // Este efeito corre sempre que 'loginSuccess' ou 'isAuthenticated' mudam
    useEffect(() => {
        // Se o login teve sucesso E o contexto já confirmou a autenticação...
        if (loginSuccess && isAuthenticated) {
            console.log("Auth state atualizado! Navegando para:", from);
            // ...navegamos para o destino
            navigate(from, { replace: true });
        }
    }, [loginSuccess, isAuthenticated, navigate, from]); // Dependências


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoginSuccess(false); // Reseta

        // Validação no frontend (completa)
        if (loginType === 'pf' && !email.trim()) {
            return setError('O email é obrigatório.');
        }
        if (loginType === 'pj' && !cnpj.trim()) {
            return setError('O CNPJ é obrigatório.');
        }
        if (!password) {
            return setError('A senha é obrigatória.');
        }
        
        setLoading(true);

        // Prepara os dados para enviar à API (completo)
        const bodyData = {
            type: loginType,
            password: password,
            ...(loginType === 'pf' ? { email: email } : { cnpj: cnpj })
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

            // Salva o token no contexto
            login(data.token);

            console.log("Login API OK. Aguardando atualização de estado...");

            // --- MUDANÇA: Apenas sinaliza sucesso (o useEffect cuida da navegação) ---
            setLoginSuccess(true);

        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Para o loading em caso de erro
        }
        // --- MUDANÇA: 'finally' removido para permitir que 'loading' continue ---
    };

    return (
        // Layout 100% preservado
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-6">
            <div className="max-w-6xl w-full grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border-t border-l border-gray-100 dark:border-gray-700/50 border-b border-r border-gray-300 dark:border-black/20">

                <div className="hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop"
                        alt="Mãos segurando um punhado de terra com uma planta brotando"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-8 md:p-12 flex flex-col">
                    <div className="text-center mb-8">
                        <h1 className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">Acesse sua Conta</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Bem-vindo(a) de volta!</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex-grow min-h-[380px]">
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {/* --- MUDANÇA: Desabilita fieldset durante loading OU sucesso --- */}
                        <fieldset disabled={loading || loginSuccess} className="space-y-4">
                            
                            {/* Seletor de Tipo de Conta */}
                            <div className="flex justify-around bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                <button type="button" onClick={() => setLoginType('pf')} className={`flex-1 py-2 rounded-md transition-colors duration-200 ${loginType === 'pf' ? 'bg-brand-green text-white font-semibold shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    Conta Pessoal
                                </button>
                                <button type="button" onClick={() => setLoginType('pj')} className={`flex-1 py-2 rounded-md transition-colors duration-200 ${loginType === 'pj' ? 'bg-brand-green text-white font-semibold shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    Conta de Empresa
                                </button>
                            </div>
                            
                            {/* Campo de Identificação Condicional (COMPLETO) */}
                            {loginType === 'pf' ? (
                                <InputField 
                                    id="email" 
                                    label="Email" 
                                    type="email" 
                                    placeholder="seu@email.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    iconClass="fa-envelope"
                                />
                            ) : (
                                <InputField 
                                    id="cnpj" 
                                    label="CNPJ" 
                                    placeholder="00.000.000/0000-00" 
                                    value={cnpj} 
                                    onChange={(e) => setCnpj(e.target.value)} 
                                    iconClass="fa-building"
                                />
                            )}
                            
                            {/* Campo de Senha (COMPLETO) */}
                            <InputField 
                                id="password" 
                                label="Senha" 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="Sua senha" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                iconClass="fa-lock"
                            >
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand-green">
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </InputField>

                            {/* Botão de Login */}
                            <div className="pt-2">
                                <button type="submit" disabled={loading || loginSuccess} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-brand-green hover:scale-105 transform transition-all duration-300 btn-glow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed">
                                    {/* --- MUDANÇA: Feedback visual --- */}
                                    {loading ? 'Entrando...' : (loginSuccess ? 'Redirecionando...' : 'Entrar')}
                                </button>
                            </div>
                        </fieldset>
                    </form>
                    <div className="mt-8 text-center">
                         <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                             Não tem uma conta?{' '}
                            <Link to="/cadastro" className="font-medium text-brand-green hover:underline">Cadastre-se</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;

