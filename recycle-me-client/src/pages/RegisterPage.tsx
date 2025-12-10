import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField'; 

type CadastroType = 'pf' | 'pj';

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
        { label: "Mín. 8 car.", valid: password.length >= 8 },
        { label: "Maiúscula", valid: /[A-Z]/.test(password) },
        { label: "Minúscula", valid: /[a-z]/.test(password) },
        { label: "Número", valid: /[0-9]/.test(password) },
        { label: "Especial", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
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
            if (isRegistered) { setError("CNPJ já cadastrado. Faça login."); setFetchingCnpj(false); return; }
            
            // API Externa (BrasilAPI)
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
        setError(null); setSuccess(null); setLoading(true);
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

    const handleStepClick = (step: number) => {
        if (step < currentStep) setCurrentStep(step);
    };

    // Componente wrapper para inputs "antigos" (estilo bloco)
 

    // --- NOVO COMPONENTE: INPUT ESTILO "CLEAN" (Transparente + Borda) ---
    // Usado especificamente para os dados da empresa para não poluir o visual
    const UnderlinedInput = ({ label, value, onChange, iconClass, readOnly = false, placeholder }: any) => (
        <div className="relative group">
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

    const PasswordRequirements = () => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 mb-2 grid grid-cols-2 gap-x-2 gap-y-1.5 animate-fadeIn">
            {passwordRules.map((rule, index) => (
                <div key={index} className={`flex items-center gap-2 text-[10px] font-bold transition-colors duration-300 ${rule.valid ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                    <i className={`fas ${rule.valid ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                    <span>{rule.label}</span>
                </div>
            ))}
        </div>
    );

    const steps = cadastroType === 'pf' 
        ? [{ id: 1, label: 'Nome' }, { id: 2, label: 'Contato' }, { id: 3, label: 'Senha' }]
        : [{ id: 1, label: 'CNPJ' }, { id: 2, label: 'Dados' }, { id: 3, label: 'Acesso' }];

    const progressWidth = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4 transition-colors duration-300">
            
            <div className="w-full max-w-6xl h-[750px] grid md:grid-cols-2 rounded-[2.5rem] shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

                <div className="hidden md:block relative h-full">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Nature" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                    <div className="absolute bottom-16 left-12 text-white max-w-sm animate-slideUp">
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Faça a diferença.</h2>
                        <p className="text-white/90 text-lg font-medium leading-relaxed">Junte-se à comunidade que está redefinindo o futuro do planeta.</p>
                    </div>
                </div>

                <div className="h-full flex flex-col px-12 py-14 relative">
                    
                    <div className="shrink-0 text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Criar Conta</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Comece sua jornada sustentável</p>
                    </div>

                    <div className="shrink-0 w-full flex flex-col items-center mb-8">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full mb-8 relative">
                            <button type="button" onClick={() => { setCadastroType('pf'); setCurrentStep(1); setError(null); }} className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${cadastroType === 'pf' ? 'bg-white dark:bg-gray-700 text-brand-green shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Pessoal</button>
                            <button type="button" onClick={() => { setCadastroType('pj'); setCurrentStep(1); setError(null); }} className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${cadastroType === 'pj' ? 'bg-white dark:bg-gray-700 text-brand-green shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Empresa</button>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="w-full px-8 relative flex items-center justify-center">
                            <div className="absolute top-1/2 left-8 right-8 h-[4px] bg-gray-100 dark:bg-gray-800 -z-0 -translate-y-1/2 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-green transition-all duration-500 ease-out" style={{ width: `${progressWidth}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center w-full relative z-10">
                                {steps.map((step) => {
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    return (
                                        <div key={step.id} onClick={() => handleStepClick(step.id)} className={`flex flex-col items-center group`}>
                                            <div className={`w-4 h-4 rounded-full transition-all duration-300 border-[3px] box-content cursor-pointer ${isActive ? 'border-brand-green bg-white scale-125 shadow-lg' : isCompleted ? 'border-brand-green bg-brand-green' : 'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'}`}></div>
                                            <span className={`text-[10px] font-bold mt-3 uppercase tracking-widest transition-colors ${isActive ? 'text-brand-green' : 'text-gray-300 dark:text-gray-600'}`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-[24px] shrink-0 flex items-center justify-center mb-4">
                        {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full font-bold animate-shake flex items-center gap-2"><i className="fas fa-exclamation-circle"></i> {error}</p>}
                        {success && <p className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-full font-bold animate-pulse flex items-center gap-2"><i className="fas fa-check-circle"></i> {success}</p>}
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col justify-center space-y-8">
                        
                        <div className="w-full space-y-6 pt-2">
                            {/* PF */}
                            {cadastroType === 'pf' && (
                                <>
                                    {currentStep === 1 && (
                                        <div className="animate-slideRight space-y-6">
                                            <InputField id="name" label="Nome Completo" placeholder="Seu nome e sobrenome" value={name} onChange={(e) => setName(e.target.value)} iconClass="fa-user"/>
                                        </div>
                                    )}
                                    {currentStep === 2 && (
                                        <div className="animate-slideRight space-y-6">
                                            <InputField id="email" label="Seu Melhor E-mail" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope"/>
                                            <InputField id="confirmEmail" label="Confirme o E-mail" type="email" placeholder="Digite novamente" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} iconClass="fa-envelope-open-text"/>
                                        </div>
                                    )}
                                    {currentStep === 3 && (
                                        <div className="animate-slideRight space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Senha forte" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField>
                                                <InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} placeholder="Repita" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} iconClass="fa-check-circle"/>
                                            </div>
                                            <PasswordRequirements />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PJ */}
                            {cadastroType === 'pj' && (
                                <>
                                    {currentStep === 1 && (
                                        <div className="animate-slideRight space-y-6">
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Buscaremos os dados automaticamente.</p>
                                            </div>
                                            <InputField id="cnpj" label="CNPJ da Empresa" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-building"/>
                                        </div>
                                    )}
                                    
                                    {/* --- AQUI ESTÁ A MUDANÇA PRINCIPAL PARA O VISUAL CLEAN --- */}
                                    {currentStep === 2 && (
                                        <div className="animate-slideRight space-y-6">
                                            {/* Razão Social (Somente Leitura - Clean) */}
                                            <UnderlinedInput 
                                                label="Razão Social" 
                                                value={razaoSocial} 
                                                onChange={() => {}} 
                                                iconClass="fa-lock" 
                                                readOnly={true} 
                                            />
                                            
                                            {/* Nome Fantasia (Editável - Clean) */}
                                            <UnderlinedInput 
                                                label="Nome Fantasia" 
                                                value={tradeName} 
                                                onChange={(e: any) => setTradeName(e.target.value)} 
                                                placeholder="Ex: Mercado Central" 
                                                iconClass="fa-store" 
                                            />

                                            <div className="grid grid-cols-2 gap-6">
                                                {/* CEP (Somente Leitura - Clean) */}
                                                <UnderlinedInput 
                                                    label="CEP" 
                                                    value={cep} 
                                                    onChange={() => {}} 
                                                    iconClass="fa-map-marker-alt" 
                                                    readOnly={true} 
                                                />
                                                
                                                {/* Número (Editável - Clean) */}
                                                <UnderlinedInput 
                                                    label="Número" 
                                                    value={numero} 
                                                    onChange={(e: any) => setNumero(e.target.value)} 
                                                    placeholder="123" 
                                                    iconClass="fa-hashtag" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="animate-slideRight space-y-4">
                                            <InputField id="email" label="E-mail Corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" iconClass="fa-envelope"/>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField>
                                                <InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita" iconClass="fa-check-circle"/>
                                            </div>
                                            <PasswordRequirements />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-auto w-full pt-8">
                            <div className="flex gap-4">
                                {currentStep > 1 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-4 rounded-2xl text-sm font-bold text-gray-500 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Voltar</button>}
                                
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
                                            setCurrentStep(prev => prev + 1); 
                                        }} 
                                        className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl transition-all transform hover:-translate-y-0.5 text-sm tracking-wide ${
                                            (cadastroType === 'pf' && ((currentStep === 1 && isPfStep1Valid) || (currentStep === 2 && isPfStep2Valid))) || (cadastroType === 'pj' && (isCnpjReady || (currentStep === 2 && numero)))
                                            ? 'bg-brand-green hover:bg-emerald-500 btn-glow-green' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'
                                        }`}
                                    >
                                        {cadastroType === 'pj' && currentStep === 1 ? (fetchingCnpj ? 'Buscando...' : 'Buscar Empresa') : 'Continuar'}
                                    </button>
                                ) : (
                                    <button 
                                        type="submit" 
                                        disabled={loading || !isPfStep3Valid} 
                                        className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl transition-all transform hover:-translate-y-0.5 text-sm tracking-wide ${isPfStep3Valid ? 'bg-brand-green hover:bg-emerald-500 btn-glow-green' : 'bg-gray-300 cursor-not-allowed text-gray-500'}`}
                                    >
                                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Criar Conta'}
                                    </button>
                                )}
                            </div> 
                        </div>
                    </form>

                    <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                        <p className="text-xs text-gray-500 font-medium">Já tem conta? <Link to="/login" className="text-brand-green font-bold hover:underline ml-1">Entrar agora</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;