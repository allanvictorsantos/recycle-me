import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField'; 

type CadastroType = 'pf' | 'pj';

// Componente Visual Limpo para dados fixos da empresa
const UnderlinedInput = ({ label, value, onChange, iconClass, readOnly = false, placeholder }: any) => (
    <div className="relative group mb-2">
        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1 block">{label}</label>
        <div className="relative flex items-center">
            <i className={`fas ${iconClass} absolute left-0 text-gray-400 transition-colors group-focus-within:text-brand-green`}></i>
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full pl-7 py-2 bg-transparent border-b-2 
                    ${readOnly 
                        ? 'border-gray-200 dark:border-gray-700 text-gray-500 cursor-default' 
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-brand-green'} 
                    rounded-none focus:outline-none transition-all placeholder-gray-400/50 text-sm font-medium`}
            />
        </div>
    </div>
);

function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [cadastroType, setCadastroType] = useState<CadastroType>('pf');
    const [currentStep, setCurrentStep] = useState(1); 
    const [showPassword, setShowPassword] = useState(false);
    
    // Campos
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [razaoSocial, setRazaoSocial] = useState('');
    const [tradeName, setTradeName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cep, setCep] = useState('');
    const [numero, setNumero] = useState('');
    
    const [fetchingCnpj, setFetchingCnpj] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Regras
    const isCnpjReady = cnpj.replace(/[^\d]/g, '').length === 14;

    const passwordRules = [
        { label: "Mín. 8", valid: password.length >= 8 },
        { label: "Maiúscula", valid: /[A-Z]/.test(password) },
        { label: "Número", valid: /[0-9]/.test(password) },
    ];
    const isPasswordStrong = passwordRules.every(rule => rule.valid);
    const doPasswordsMatch = password === confirmPassword && password.length > 0;

    const isPfStep1Valid = name.trim().length > 3;
    const isPfStep2Valid = email.includes('@') && email === confirmEmail && email.length > 5;
    const isPfStep3Valid = isPasswordStrong && doPasswordsMatch;

    // Funções
    const handleCnpjBlur = async () => {
        if (!isCnpjReady) return;
        setFetchingCnpj(true); setError(null);
        try {
            const checkResponse = await axios.get(`${import.meta.env.VITE_API_URL}/markets`);
            const isRegistered = checkResponse.data.some((m: any) => m.cnpj.replace(/[^\d]/g, '') === cnpj.replace(/[^\d]/g, ''));
            if (isRegistered) { setError("CNPJ já cadastrado."); setFetchingCnpj(false); return; }
            
            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/[^\d]/g, '')}`);
            setRazaoSocial(response.data.razao_social);
            setTradeName(response.data.nome_fantasia || response.data.razao_social);
            setCep(response.data.cep);
            if (response.data.numero) setNumero(response.data.numero);
            setCurrentStep(2);
        } catch (err) { setError("CNPJ não encontrado."); } finally { setFetchingCnpj(false); }
    };

    const performAutoLogin = async () => {
        try {
            const loginData = {
                type: cadastroType,
                password: password,
                ...(cadastroType === 'pf' ? { email } : { cnpj: cnpj.replace(/[^\d]/g, '') })
            };
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, loginData);
            login(response.data.token, response.data.user);
            if (response.data.user.type === 'market') navigate('/painel-fiscal', { replace: true });
            else navigate('/mapa', { replace: true });
        } catch (err) { navigate('/login'); }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); 
        
        if (!isPfStep3Valid) {
            return setError("Verifique a senha e a confirmação.");
        }

        setSuccess(null); setLoading(true);
        const url = cadastroType === 'pf' ? `${import.meta.env.VITE_API_URL}/users` : `${import.meta.env.VITE_API_URL}/markets`;
        const body = cadastroType === 'pf' 
            ? { name, email, password }
            : { name: razaoSocial, tradeName: tradeName || razaoSocial, cnpj: cnpj.replace(/[^\d]/g, ''), email, password, cep: cep.replace(/[^\d]/g, ''), numero };
        try {
            await axios.post(url, body);
            setSuccess('Conta criada! Entrando...');
            await performAutoLogin();
        } catch (err: any) { 
            setError(err.response?.data?.message || 'Erro ao cadastrar.'); 
            setLoading(false);
        } 
    };

    const steps = cadastroType === 'pf' 
        ? [{ id: 1, label: 'Nome' }, { id: 2, label: 'Contato' }, { id: 3, label: 'Senha' }]
        : [{ id: 1, label: 'CNPJ' }, { id: 2, label: 'Dados' }, { id: 3, label: 'Acesso' }];

    const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

    // ESTILO FIXO DO BOTÃO PRINCIPAL
    const buttonClass = `h-[60px] rounded-2xl font-black text-lg shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 bg-brand-green text-white hover:bg-emerald-600 btn-glow-green disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center`;

    // --- NOVA FUNÇÃO PARA DICAS DINÂMICAS ---
    const getStepSubtitle = () => {
        if (cadastroType === 'pf') {
            if (currentStep === 1) return "Vamos começar! Qual é o seu nome?";
            if (currentStep === 2) return "Como podemos entrar em contato?";
            if (currentStep === 3) return "Crie uma senha segura para acessar.";
        } else {
            if (currentStep === 1) return "Informe o CNPJ do estabelecimento.";
            if (currentStep === 2) return "Confira o endereço e adicione o número.";
            if (currentStep === 3) return "Defina o e-mail e senha de acesso.";
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4 transition-colors duration-300">
            
            {/* CONTAINER FIXO: h-[700px] */}
            <div className="w-full max-w-5xl h-[700px] grid md:grid-cols-2 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

                {/* LADO ESQUERDO (Imagem) */}
                <div className="hidden md:block relative h-full">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Nature" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                    <div className="absolute bottom-12 left-12 text-white max-w-sm animate-slideUp">
                        <h2 className="text-4xl font-black mb-4 leading-tight">Faça a diferença.</h2>
                        <p className="text-white/90 text-lg font-medium leading-relaxed drop-shadow-md">Junte-se à comunidade que está redefinindo o futuro do planeta.</p>
                    </div>
                </div>

                {/* LADO DIREITO (Formulário) */}
                <div className="h-full flex flex-col px-10 py-10 relative">
                    
                    {/* Header com DICA DINÂMICA */}
                    <div className="shrink-0 text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-dark dark:text-white tracking-tight">Criar Conta</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium animate-fadeIn key={currentStep}">
                            {getStepSubtitle()}
                        </p>
                    </div>

                    {/* SELETOR */}
                    <div className="shrink-0 w-full flex flex-col items-center mb-6">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full relative">
                            <button type="button" onClick={() => { setCadastroType('pf'); setCurrentStep(1); setError(null); }} className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${cadastroType === 'pf' ? 'bg-white dark:bg-gray-700 text-brand-green shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Pessoal</button>
                            <button type="button" onClick={() => { setCadastroType('pj'); setCurrentStep(1); setError(null); }} className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${cadastroType === 'pj' ? 'bg-white dark:bg-gray-700 text-brand-green shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Empresa</button>
                        </div>
                        
                        {/* Barra de Progresso */}
                        <div className="w-full mt-3 px-2 flex justify-between items-center relative h-4">
                            <div className="absolute top-1/2 left-2 right-2 h-1 bg-gray-100 dark:bg-gray-800 -z-0 -translate-y-1/2 rounded-full">
                                <div className="h-full bg-brand-green transition-all duration-500" style={{ width: `${progressWidth}%` }}></div>
                            </div>
                            {steps.map((step) => (
                                <div key={step.id} className={`w-2.5 h-2.5 rounded-full border-2 box-content z-10 transition-all ${currentStep >= step.id ? 'bg-brand-green border-brand-green' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Placeholder Erro/Sucesso */}
                    <div className="h-[24px] shrink-0 flex items-center justify-center mb-4">
                        {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full font-bold animate-shake"><i className="fas fa-exclamation-circle mr-1"></i>{error}</p>}
                        {success && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full font-bold animate-pulse"><i className="fas fa-check-circle mr-1"></i>{success}</p>}
                    </div>

                    {/* FORMULÁRIO */}
                    <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col justify-between overflow-hidden">
                        
                        {/* Área de Inputs (Top Aligned) */}
                        <div className="w-full space-y-4">
                            {/* PF */}
                            {cadastroType === 'pf' && (
                                <>
                                    {currentStep === 1 && <div className="animate-fadeIn space-y-4"><InputField id="name" label="Nome Completo" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} iconClass="fa-user"/></div>}
                                    {currentStep === 2 && (
                                        <div className="animate-fadeIn space-y-4">
                                            <InputField id="email" label="E-mail" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope"/>
                                            <InputField id="confirmEmail" label="Confirmar E-mail" type="email" placeholder="Repita o e-mail" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} iconClass="fa-envelope-open-text"/>
                                        </div>
                                    )}
                                    {currentStep === 3 && (
                                        <div className="animate-fadeIn space-y-3">
                                            <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Senha forte" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField>
                                            <InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} iconClass="fa-check-circle"/>
                                            <div className="grid grid-cols-3 gap-1 mt-1">{passwordRules.map((r, i) => (<span key={i} className={`text-[9px] font-bold ${r.valid ? 'text-green-500' : 'text-gray-300'}`}>{r.label}</span>))}</div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PJ */}
                            {cadastroType === 'pj' && (
                                <>
                                    {currentStep === 1 && (
                                        <div className="animate-fadeIn space-y-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center gap-2">
                                                <i className="fas fa-bolt"></i> Buscaremos os dados automaticamente.
                                            </div>
                                            <InputField id="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-building"/>
                                        </div>
                                    )}
                                    
                                    {currentStep === 2 && (
                                        <div className="animate-fadeIn space-y-2">
                                            <UnderlinedInput label="Razão Social" value={razaoSocial} onChange={() => {}} iconClass="fa-lock" readOnly={true} />
                                            <UnderlinedInput label="Nome Fantasia" value={tradeName} onChange={(e: any) => setTradeName(e.target.value)} placeholder="Ex: Mercado Central" iconClass="fa-store" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <UnderlinedInput label="CEP" value={cep} onChange={() => {}} iconClass="fa-map-marker-alt" readOnly={true} />
                                                <UnderlinedInput label="Número" value={numero} onChange={(e: any) => setNumero(e.target.value)} placeholder="123" iconClass="fa-hashtag" />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="animate-fadeIn space-y-3">
                                            <InputField id="email" label="E-mail Corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" iconClass="fa-envelope"/>
                                            <div className="grid grid-cols-2 gap-3">
                                                <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" iconClass="fa-lock"/>
                                                <InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita" iconClass="fa-check-circle"/>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* BOTÕES FIXOS NA PARTE INFERIOR (mt-auto) com MB-[35px] para subir exatos 35px */}
                        <div className="mt-auto w-full pt-4 mb-[35px]">
                            <div className="flex gap-3 h-[60px]">
                                {currentStep > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentStep(prev => prev - 1)} 
                                        className="h-[60px] w-[60px] shrink-0 rounded-2xl text-gray-400 hover:text-brand-green hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all flex items-center justify-center border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                        title="Voltar"
                                    >
                                        <i className="fas fa-arrow-left text-xl"></i>
                                    </button>
                                )}
                                
                                {currentStep < 3 ? (
                                    <button 
                                        type="button" 
                                        onClick={() => { 
                                            if(cadastroType === 'pf') {
                                                if (currentStep === 1 && !isPfStep1Valid) return setError("Nome muito curto.");
                                                if (currentStep === 2 && !isPfStep2Valid) return setError("E-mail inválido.");
                                            } else {
                                                if (currentStep === 1 && (!fetchingCnpj || !isCnpjReady)) return handleCnpjBlur();
                                                if (currentStep === 2 && !numero) return setError("Número obrigatório.");
                                            }
                                            setError(null);
                                            setCurrentStep(prev => prev + 1); 
                                        }} 
                                        disabled={loading}
                                        className={`${buttonClass} flex-1`}
                                    >
                                        {cadastroType === 'pj' && currentStep === 1 ? (fetchingCnpj ? 'Buscando...' : 'Buscar') : 'Continuar'}
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className={`${buttonClass} flex-1`}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Criar Conta'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700 text-center shrink-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Já tem conta? <Link to="/login" className="text-brand-green font-bold hover:underline ml-1">Entrar agora</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;