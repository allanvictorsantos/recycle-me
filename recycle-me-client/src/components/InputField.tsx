// Salve este arquivo como: src/components/InputField.tsx

import React from 'react';

// 1. Definimos os tipos das props para ter um código mais seguro e com auto-complete
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string; // O '?' torna a prop opcional
  required?: boolean;
  iconClass?: string;
  // Prop especial para "filhos", como o botão de ver senha
  children?: React.ReactNode;
}

// 2. Criamos o componente com as props bem definidas e o exportamos
export function InputField({
  id, label, value, onChange, placeholder,
  type = 'text', required = true, iconClass = 'fa-user',
  children
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="mt-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className={`fas ${iconClass} text-gray-400`}></i>
        </div>
        <input
          type={type}
          id={id}
          name={id}
          required={required}
          placeholder={placeholder}
          // Adiciona um espaçamento à direita se houver um "filho" (o botão de olho)
          className={`
            block w-full pl-10 px-3 py-2 bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none
            focus:ring-brand-green focus:border-brand-green
            ${children ? 'pr-10' : ''}
          `}
          value={value}
          onChange={onChange}
        />
        {/* Renderiza o botão de olho ou qualquer outro "filho" que for passado */}
        {children}
      </div>
    </div>
  );
}

