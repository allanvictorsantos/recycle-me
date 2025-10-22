// Salve este arquivo como: src/pages/RegisterPage.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { InputField } from '../components/InputField'; 

type CadastroType = 'pf' | 'pj';

function RegisterPage() {
    const [cadastroType, setCadastroType] = useState<CadastroType>('pf');
    const [showPassword, setShowPassword] = useState(false);
    
    // Campos PF
    const [name, setName] = useState('');
    
    // Campos Comuns
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Campos PJ
    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cep, setCep] = useState('');
    const [numero, setNumero] = useState('');

    // Estados de Feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        // --- MUDANÇA 1: VALIDAÇÃO NO FRONTEND ---
        // Checa os campos antes de fazer qualquer outra coisa.
        if (!email.trim() || !password.trim()) {
            setError('Email e Senha são obrigatórios.');
            return; // Para a execução
        }
        if (cadastroType === 'pf' && !name.trim()) {
            setError('O nome é obrigatório para conta pessoal.');
            return; // Para a execução
        }
        if (cadastroType === 'pj' && (!razaoSocial.trim() || !cnpj.trim() || !cep.trim() || !numero.trim())) {
            setError('Todos os campos da empresa são obrigatórios.');
            return; // Para a execução
        }
        // --- FIM DA VALIDAÇÃO ---

        setLoading(true);

        let url = '';
        let bodyData: { [key: string]: any } = {};

        if (cadastroType === 'pf') {
            url = 'http://localhost:3000/users'; 
            bodyData = { name, email, password };
        } else {
            url = 'http://localhost:3000/markets';
            bodyData = { 
                name: razaoSocial,
                cnpj, 
                password,
                cep,
                numero,
            };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao tentar cadastrar');
            }

            setSuccess('Cadastro realizado com sucesso! Você será redirecionado para a página principal...');
            
            // --- MUDANÇA 2: REDIRECIONAMENTO PARA A HOMEPAGE ---
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2500);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-6">
            <div className="max-w-6xl w-full grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border-t border-l border-gray-100 dark:border-gray-700/50 border-b border-r border-gray-300 dark:border-black/20">

                <div className="hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop"
                        alt="Mãos segurando um punhado de terra com uma planta brotando"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block text-2xl font-extrabold tracking-tighter text-brand-dark dark:text-white">
                            ♻️ RECYCLE_ME
                        </Link>
                        <h1 className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">Crie sua Conta</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Comece sua jornada de sustentabilidade hoje!</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {success && (
                             <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                                 <span className="block sm:inline">{success}</span>
                             </div>
                        )}
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        <fieldset disabled={loading || !!success} className="space-y-4">
                            
                            <div className="flex justify-around bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                <button type="button" onClick={() => setCadastroType('pf')} className={`flex-1 py-2 rounded-md transition-colors duration-200 ${cadastroType === 'pf' ? 'bg-brand-green text-white font-semibold shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    Conta Pessoal
                                </button>
                                <button type="button" onClick={() => setCadastroType('pj')} className={`flex-1 py-2 rounded-md transition-colors duration-200 ${cadastroType === 'pj' ? 'bg-brand-green text-white font-semibold shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    Conta de Empresa
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField id="email" label="Email" type="email" placeholder="contato@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope"/>
                                <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Crie uma senha segura" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock">
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand-green">
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </InputField>
                            </div>
                            
                            {cadastroType === 'pf' && (
                                <InputField id="name" label="Seu Nome Completo" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} iconClass="fa-user"/>
                            )}

                            {cadastroType === 'pj' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField id="razaoSocial" label="Nome da Empresa (Razão Social)" placeholder="Ex: Recycle Me Ltda" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} iconClass="fa-building"/>
                                        <InputField id="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-file-alt"/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField id="cep" label="CEP" placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} iconClass="fa-map-marker-alt"/>
                                        <InputField id="numero" label="Número" placeholder="123" value={numero} onChange={(e) => setNumero(e.target.value)} iconClass="fa-hashtag"/>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-brand-green hover:scale-105 transform transition-all duration-300 btn-glow-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                                </button>
                            </div>
                        </fieldset>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="font-medium text-brand-green hover:underline">Faça Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;

