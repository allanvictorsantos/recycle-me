import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { InputField } from '../components/InputField'; 

type CadastroType = 'pf' | 'pj';

function RegisterPage() {
    const navigate = useNavigate();
    
    const [cadastroType, setCadastroType] = useState<CadastroType>('pf');
    const [pjStep, setPjStep] = useState(1); 
    const [showPassword, setShowPassword] = useState(false);
    
    // Campos
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
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

    const cleanCnpjLength = cnpj.replace(/[^\d]/g, '').length;
    const isCnpjReady = cleanCnpjLength === 14;

    const handleCnpjBlur = async () => {
        if (!isCnpjReady) return;
        setFetchingCnpj(true);
        setError(null);
        try {
            const checkResponse = await axios.get('http://localhost:3000/markets');
            const isRegistered = checkResponse.data.some((m: any) => m.cnpj.replace(/[^\d]/g, '') === cnpj.replace(/[^\d]/g, ''));
            
            if (isRegistered) {
                setError("CNPJ já cadastrado. Faça login.");
                setFetchingCnpj(false);
                return;
            }

            const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/[^\d]/g, '')}`);
            const data = response.data;
            setRazaoSocial(data.razao_social);
            setTradeName(data.nome_fantasia || data.razao_social);
            setCep(data.cep);
            if (data.numero) setNumero(data.numero);
            setPjStep(2);
        } catch (err) {
            setError("CNPJ não encontrado.");
        } finally {
            setFetchingCnpj(false);
        }
    };

    const handleStepClick = (step: number) => {
        if (step < pjStep) {
            setPjStep(step);
            setError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return; }
        
        if (password !== confirmPassword) { setError('As senhas não conferem.'); return; }

        if (cadastroType === 'pj') {
            const emailDomain = email.split('@')[1];
            const forbidden = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com'];
            if (forbidden.includes(emailDomain)) { setError('Use e-mail corporativo.'); return; }
        }

        setLoading(true);
        const url = cadastroType === 'pf' ? 'http://localhost:3000/users' : 'http://localhost:3000/markets';
        const body = cadastroType === 'pf' 
            ? { name, email, password }
            : { name: razaoSocial, tradeName: tradeName || razaoSocial, cnpj: cnpj.replace(/[^\d]/g, ''), email, password, cep: cep.replace(/[^\d]/g, ''), numero };

        try {
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao cadastrar');
            
            setSuccess('Sucesso! Redirecionando...');
            setTimeout(() => navigate('/login', { replace: true }), 2000);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    const steps = [
        { id: 1, label: 'CNPJ' },
        { id: 2, label: 'Dados' },
        { id: 3, label: 'Acesso' }
    ];

    return (
        <main className="min-h-screen flex items-center justify-center bg-brand-cream dark:bg-brand-dark p-4">
            <div className="w-full max-w-5xl h-[600px] grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">

                <div className="hidden md:block relative h-full">
                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Nature" className="w-full h-full object-cover absolute inset-0" />
                    <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
                </div>

                <div className="h-full flex flex-col px-10 py-4 relative">
                    
                    <div className="h-[50px] shrink-0 text-center">
                        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Crie sua Conta</h1>
                        <p className="text-xs text-gray-500">Junte-se ao Recycle_me</p>
                    </div>

                    <div className="shrink-0 w-full flex flex-col items-center mb-1 mt-0">
                        
                        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full mb-3">
                            <button type="button" onClick={() => setCadastroType('pf')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${cadastroType === 'pf' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Pessoal</button>
                            <button type="button" onClick={() => { setCadastroType('pj'); if(pjStep === 0) setPjStep(1); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${cadastroType === 'pj' ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Empresa</button>
                        </div>

                        <div className="h-[40px] w-full flex items-center justify-center">
                            {cadastroType === 'pj' ? (
                                <div className="flex justify-between items-center w-full px-6 animate-fadeIn">
                                    {steps.map((step) => {
                                        const isActive = pjStep === step.id;
                                        const isCompleted = pjStep > step.id;
                                        return (
                                            <div key={step.id} onClick={() => handleStepClick(step.id)} className={`flex flex-col items-center relative w-1/3 ${step.id < pjStep ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 z-10 border-2 ${isActive ? 'bg-white border-brand-green text-brand-green scale-110 ring-2 ring-brand-green/30' : ''} ${isCompleted ? 'bg-brand-green border-brand-green text-white' : ''} ${!isActive && !isCompleted ? 'bg-gray-100 border-gray-200 text-gray-400' : ''}`}>
                                                    {isCompleted ? <i className="fas fa-check"></i> : step.id}
                                                </div>
                                                <span className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-brand-green' : 'text-gray-300'}`}>{step.label}</span>
                                                {step.id < 3 && <div className={`absolute top-3.5 left-1/2 w-full h-[2px] -z-0 ${pjStep > step.id ? 'bg-brand-green' : 'bg-gray-200'}`}></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <div className="w-full"></div>}
                        </div>
                    </div>

                    <div className="h-[20px] shrink-0 flex items-center justify-center mb-1">
                        {error && <p className="text-[10px] text-red-500 font-bold animate-shake bg-red-50 px-2 rounded">{error}</p>}
                        {success && <p className="text-[10px] text-green-600 font-bold animate-pulse bg-green-50 px-2 rounded">{success}</p>}
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex-grow flex flex-col justify-between">
                        
                        <div className="space-y-2 w-full pt-0">
                            {cadastroType === 'pf' && (
                                <div className="animate-fadeIn space-y-3">
                                    <InputField id="name" label="Nome" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} iconClass="fa-user"/>
                                    <InputField id="email" label="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} iconClass="fa-envelope"/>
                                    <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} placeholder="Senha forte" value={password} onChange={(e) => setPassword(e.target.value)} iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField>
                                    <InputField id="confirmPassword" label="Confirmar Senha" type={showPassword ? 'text' : 'password'} placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} iconClass="fa-check-circle"/>
                                </div>
                            )}

                            {cadastroType === 'pj' && pjStep === 1 && (
                                <div className="py-6 animate-fadeIn space-y-6">
                                    <div className="text-center mb-4"><p className="text-xs text-gray-500">Digite o CNPJ para identificação.</p></div>
                                    <InputField id="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} iconClass="fa-id-card"/>
                                </div>
                            )}

                            {cadastroType === 'pj' && pjStep === 2 && (
                                <div className="animate-fadeIn pt-2 space-y-2">
                                    
                                    {/* CORREÇÃO: Removido InputWrapper, usando disabled direto */}
                                    <InputField id="razaoSocial" label="Razão Social" value={razaoSocial} onChange={() => {}} placeholder="" iconClass="fa-lock" disabled={true} />
                                    
                                    <InputField id="tradeName" label="Nome Fantasia" value={tradeName} onChange={(e) => setTradeName(e.target.value)} placeholder="Ex: Mercado" iconClass="fa-store"/>
                                    
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        {/* CORREÇÃO: Removido InputWrapper, usando disabled direto */}
                                        <InputField id="cep" label="CEP" value={cep} onChange={() => {}} placeholder="" iconClass="fa-map-marker-alt" disabled={true} />
                                        
                                        <InputField id="numero" label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" iconClass="fa-hashtag"/>
                                    </div>
                                </div>
                            )}

                            {cadastroType === 'pj' && pjStep === 3 && (
                                <div className="animate-fadeIn pt-2 space-y-3">
                                    <div className="relative">
                                        <InputField id="email" label="Email Corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@empresa.com" iconClass="fa-envelope"/><p className="text-[9px] text-gray-400 absolute right-0 top-0 mt-1">*Sem Gmail/Hotmail</p>
                                    </div>
                                    <InputField id="password" label="Senha" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" iconClass="fa-lock"><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-brand-green"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button></InputField>
                                    <InputField id="confirmPassword" label="Confirmar Senha" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" iconClass="fa-check-circle"/>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 w-full">
                            {cadastroType === 'pf' && <button type="submit" className="w-full py-3 rounded-lg bg-brand-green text-white font-bold hover:bg-opacity-90 shadow-sm transition-all text-sm">Criar Conta Pessoal</button>}
                            {cadastroType === 'pj' && pjStep === 1 && <button type="button" onClick={handleCnpjBlur} disabled={fetchingCnpj || !isCnpjReady} className={`w-full py-3 rounded-lg font-bold text-white shadow-sm transition-all text-sm ${isCnpjReady ? 'bg-brand-green hover:scale-105 cursor-pointer' : 'bg-gray-400 cursor-not-allowed opacity-70'}`}>{fetchingCnpj ? <i className="fas fa-spinner fa-spin"></i> : 'Buscar e Continuar'}</button>}
                            {cadastroType === 'pj' && pjStep === 2 && <div className="flex gap-3"><button type="button" onClick={() => setPjStep(1)} className="flex-1 py-2.5 text-xs font-bold text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">Voltar</button><button type="button" onClick={() => { if(numero) setPjStep(3); else setError("Preencha o número"); }} className="flex-[2] py-2.5 text-xs font-bold text-white bg-brand-green rounded-lg hover:scale-105 shadow-sm">Confirmar</button></div>}
                            {cadastroType === 'pj' && pjStep === 3 && <div className="flex gap-3"><button type="button" onClick={() => setPjStep(2)} className="flex-1 py-2.5 text-xs font-bold text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50">Voltar</button><button type="submit" className="flex-[2] py-2.5 text-xs font-bold text-white bg-brand-green rounded-lg hover:scale-105 shadow-sm">Finalizar</button></div>}
                        </div>
                    </form>

                    <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
                        <p className="text-xs text-gray-500">Já tem conta? <Link to="/login" className="text-brand-green font-bold hover:underline">Entrar</Link></p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default RegisterPage;