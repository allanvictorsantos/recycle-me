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
        { label: "Mín. 8 caracteres", valid: password.length >= 8 },
        { label: "Maiúscula", valid: /[A-Z]/.test(password) },
        { label: "Minúscula", valid: /[a-z]/.test(password) },
        { label: "Número", valid: /[0-9]/.test(password) },
        { label: "Especial (!@#)", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
    const isPasswordStrong = passwordRules.every(rule => rule.valid);
    const doPasswordsMatch = password === confirmPassword && password.length > 0;
    const isPfStep1Valid = name.trim().length > 3;
    const isPfStep2Valid = email.includes('@') && email === confirmEmail && email.length > 5;
    const isPfStep3Valid = isPasswordStrong && doPasswordsMatch;

    const handleCnpjBlur = async () => {
        if (!isCnpjReady) return;
        setFetchingCnpj(true); setError(null);
        try {
            const checkResponse = await axios.get('http://localhost:3000/markets');
            const isRegistered = checkResponse.data.some((m: any) => m.cnpj.replace(/[^\d]/g, '') === cnpj.replace(/[^\d]/g, ''));
            if (isRegistered) { setError("CNPJ já cadastrado. Faça login."); setFetchingCnpj(false); return; }
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
            const response = await axios.post('http://localhost:3000/auth/login', loginData);
            // AQUI: Aguarda o login atualizar o estado antes de navegar
            await login(response.data.token, response.data.user);
            
            // Pequeno delay para garantir que o estado propagou
            setTimeout(() => {
                if (response.data.user.type === 'market') navigate('/painel-fiscal', { replace: true });
                else navigate('/mapa', { replace: true });
            }, 100);
        } catch (err) { navigate('/login'); }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null); setSuccess(null); setLoading(true);

        const url = cadastroType === 'pf' ? 'http://localhost:3000/users' : 'http://localhost:3000/markets';
        const body = cadastroType === 'pf' 
            ? { name, email, password }
            : { name: razaoSocial, tradeName: tradeName || razaoSocial, cnpj: cnpj.replace(/[^\d]/g, ''), email, password, cep: cep.replace(/[^\d]/g, ''), numero };

        try {
            await axios.post(url, body);
            setSuccess('Sucesso! Entrando...');
            await performAutoLogin();
        } catch (err: any) { 
            setError(err.response?.data?.message || 'Erro ao cadastrar.'); 
            setLoading(false);
        } 
    };

    const handleStepClick = (step: number) => {
        if (step < currentStep) setCurrentStep(step);
    };

    const InputWrapper = ({ disabled, children }: { disabled?: boolean, children: React.ReactNode }) => (
        <div className={`transition-all duration-300 ${disabled ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pointer-events-none' : ''}`}>{children}</div>
    );

    const PasswordRequirements = () => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700 mb-2 grid grid-cols-2 gap-x-2 gap-y-1 animate-fadeIn">
            {passwordRules.map((rule, index) => (
                <div key={index} className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors duration-300 ${rule.valid ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                    <i className={`fas ${rule.valid ? 'fa-check-circle' : 'fa-circle text-[6px]'}`}></i>
                    <span>{rule.label}</span>
                </div>
            ))}
        </div>
    );

    const steps = cadastroType === 'pf' 
        ? [{ id: 1, label: 'Nome' }, { id: 2, label: 'Contato' }, { id: 3, label: 'Senha' }]
        : [{ id: 1, label: 'CNPJ' }, { id: 2, label: 'Dados' }, { id: 3, label: 'Acesso' }];

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4">
            
            {/* CONTAINER PADRONIZADO (h-[750px] igual Login) */}
            <div className="w-full max-w-6xl h-[750px] grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

                <div className="hidden md:block relative h-full">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Nature" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                </div>

                {/* Layout Flexível Vertical - Padding 12 */}
                <div className="h-full flex flex-col px-10 py-12 relative">
                    
                    {/* Cabeçalho Fixo */}
                    <div className="h-[60px] shrink-0 text-center">
                        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Crie sua Conta</h1>
                        <p className="text-xs text-gray-500 mt-1">Comece sua jornada sustentável</p>
                    </div>

                    {/* Navegação Fixa */}
                    <div className="shrink-0 w-full flex flex-col items-center mb-4 h-[80px]">
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full mb-4">
                            <button type="button" onClick={() => { setCadastroType('pf'); setCurrentStep(1); setError(null); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${cadastroType === 'pf' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Pessoal</button>
                            <button type="button" onClick={() => { setCadastroType('pj'); setCurrentStep(1); setError(null); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${cadastroType === 'pj' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Empresa</button>
                        </div>

                        <div className="w-full px-6 relative flex items-center justify-center">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-800 -z-0 -translate-y-1/2"></div>
                            <div className="flex justify-between items-center w-full relative z-10">
                                {steps.map((step) => {
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    return (
                                        <div key={step.id} onClick={() => handleStepClick(step.id)} className={`flex flex-col items-center bg-white dark:bg-gray-900 px-2 cursor-pointer transition-all ${step.id > currentStep ? 'cursor-default opacity-50' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${isActive ? 'border-brand-green text-brand-green scale-125 shadow-sm bg-white' : isCompleted ? 'bg-brand-green border-brand-green text-white' : 'border-gray-300 text-gray-400 bg-gray-50'}`}>
                                                {isCompleted ? <i className="fas fa-check"></i> : step.id}
                                            </div>
                                            <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isActive ? 'text-brand-green' : 'text-gray-400'}`}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="h-[20px] shrink-0 flex items-center justify-center mb-2">
                        {error && <p className="text-[10px] text-red-500 font-bold animate-shake bg-red-50 px-3 py-1 rounded-full">{error}</p>}
                        {success && <p className="text-[10px] text-green-600 font-bold animate-pulse bg-green-50 px-3 py-1 rounded-full">{success}</p>}
                    </div>

                    {/* FORMULÁRIO: A MÁGICA DO FLEX */}
                    {/* flex-grow faz ele ocupar o espaço vazio. justify-between empurra os botões para baixo. */}
                    <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col justify-between">
                        
                        {/* CAMPOS: Centralizados no espaço superior */}
                        <div className="w-full flex flex-col justify-center flex-grow space-y-5">
                            {/* ... (Campos PF e PJ permanecem iguais ao anterior) ... */}
                            {cadastroType === 'pf' && (
                                <>
                                    {currentStep === 1 && <div className="animate-fadeIn space-y-5 pt-4"><InputField id="name" label="Nome Completo" placeholder="Seu nome e sobrenome" value={name} onChange={(e) => setName(e.target.value)} iconClass="fa-user"/></div>}
                                    {currentStep === 2 && <div className="animate-fadeIn space-y-5"><InputField id="email" label="Seu Melhor E-mail" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope"/><InputField id="confirmEmail" label="Confirme o E-mail" type="email" placeholder="Digite novamente" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} iconClass="fa-envelope-open-text"/></div>}
                                    {currentStep === 3 && <div className="animate-fadeIn space-y-3"><div className="grid grid-cols-2 gap-4"><InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Senha forte" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField><InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} placeholder="Repita" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} iconClass="fa-check-circle"/></div><PasswordRequirements /></div>}
                                </>
                            )}
                            {cadastroType === 'pj' && (
                                <>
                                    {currentStep === 1 && <div className="animate-fadeIn space-y-5"><div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center"><p className="text-xs text-blue-600 dark:text-blue-300 font-bold">Buscaremos os dados automaticamente.</p></div><InputField id="cnpj" label="CNPJ da Empresa" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-building"/></div>}
                                    {currentStep === 2 && <div className="animate-fadeIn space-y-4"><InputWrapper disabled><InputField id="razaoSocial" label="Razão Social" value={razaoSocial} onChange={() => {}} placeholder="" iconClass="fa-lock" disabled={true} /></InputWrapper><InputField id="tradeName" label="Nome Fantasia" value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder="Ex: Mercado Central" iconClass="fa-store"/><div className="grid grid-cols-2 gap-4"><InputWrapper disabled><InputField id="cep" label="CEP" value={cep} onChange={() => {}} placeholder="" iconClass="fa-map-marker-alt" disabled={true} /></InputWrapper><InputField id="numero" label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" iconClass="fa-hashtag"/></div></div>}
                                    {currentStep === 3 && <div className="animate-fadeIn space-y-3"><InputField id="email" label="E-mail Corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" iconClass="fa-envelope"/><div className="grid grid-cols-2 gap-4"><InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField><InputField id="confirmPassword" label="Confirmar" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita" iconClass="fa-check-circle"/></div><PasswordRequirements /></div>}
                                </>
                            )}
                        </div>

                        {/* BOTÕES: Mt-auto garante que fiquem no fundo */}
                        <div className="mt-auto w-full pt-6">
                            {/* PF */}
                            {cadastroType === 'pf' && (
                                <div className="flex gap-4">
                                    {currentStep > 1 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-500 border-2 border-gray-300 hover:bg-gray-50 transition-colors">Voltar</button>}
                                    {currentStep < 3 ? (
                                        <button type="button" onClick={() => { if(currentStep === 1 && isPfStep1Valid) setCurrentStep(2); else if(currentStep === 2 && isPfStep2Valid) setCurrentStep(3); else setError("Preencha corretamente."); }} className={`flex-[2] py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm ${((currentStep === 1 && isPfStep1Valid) || (currentStep === 2 && isPfStep2Valid)) ? 'bg-brand-green hover:scale-[1.02] btn-glow-green' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'}`}>Continuar</button>
                                    ) : (
                                        <button type="submit" disabled={loading || !isPfStep3Valid} className={`flex-[2] py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm ${isPfStep3Valid ? 'bg-brand-dark hover:bg-black btn-glow-dark' : 'bg-gray-300 cursor-not-allowed'}`}>{loading ? 'Criando...' : 'Finalizar Cadastro'}</button>
                                    )}
                                </div>
                            )}
                            {/* PJ */}
                            {cadastroType === 'pj' && (
                                <div className="flex gap-4">
                                    {currentStep > 1 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-500 border-2 border-gray-300 hover:bg-gray-50 transition-colors">Voltar</button>}
                                    {currentStep === 1 ? (
                                        <button type="button" onClick={handleCnpjBlur} disabled={fetchingCnpj || !isCnpjReady} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm ${isCnpjReady ? 'bg-brand-green hover:scale-[1.02] btn-glow-green' : 'bg-gray-300 cursor-not-allowed'}`}>{fetchingCnpj ? 'Buscando...' : 'Buscar Empresa'}</button>
                                    ) : currentStep === 2 ? (
                                        <button type="button" onClick={() => { if(numero) setCurrentStep(3); else setError("Preencha o número."); }} className="flex-[2] py-3.5 bg-brand-green text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all text-sm">Confirmar Dados</button>
                                    ) : (
                                        <button type="submit" disabled={loading || !isPasswordStrong || !doPasswordsMatch} className={`flex-[2] py-3.5 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all text-sm ${(isPasswordStrong && doPasswordsMatch) ? 'btn-glow-dark' : 'bg-gray-300 cursor-not-allowed'}`}>{loading ? '...' : 'Criar Conta Parceiro'}</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </form>

                    {/* RODAPÉ */}
                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                        <p className="text-xs text-gray-500">Já tem conta? <Link to="/login" className="text-brand-green font-bold hover:underline">Entrar</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;