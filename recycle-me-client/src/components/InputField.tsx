import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  iconClass?: string;
  children?: React.ReactNode;
  // --- NOVO: Aceita a propriedade disabled ---
  disabled?: boolean; 
}

export function InputField({
  id, label, value, onChange, placeholder,
  type = 'text', required = true, iconClass = 'fa-user',
  children, onBlur, disabled // Recebe aqui
}: InputFieldProps) {
  return (
    <div>
      {/* O Label não tem mais fundo nenhum, fica transparente sempre */}
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className={`fas ${iconClass} ${disabled ? 'text-gray-400' : 'text-gray-400'}`}></i>
        </div>
        
        <input
          type={type}
          id={id}
          name={id}
          required={required}
          disabled={disabled} // Aplica a trava no HTML
          placeholder={placeholder}
          onBlur={onBlur}
          onChange={onChange}
          value={value}
          // --- AQUI ESTÁ A MÁGICA ---
          // Se estiver disabled: Fundo cinza claro (dark: cinza escuro)
          // Se estiver normal: Fundo branco (dark: cinza 800)
          className={`
            block w-full pl-10 px-3 py-2 rounded-md shadow-sm
            border border-gray-300 dark:border-gray-600
            placeholder-gray-400 focus:outline-none
            text-brand-dark dark:text-white transition-colors
            ${disabled 
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-70' 
              : 'bg-white dark:bg-gray-800 focus:ring-brand-green focus:border-brand-green'
            }
            ${children ? 'pr-10' : ''}
          `}
        />
        {children}
      </div>
    </div>
  );
}