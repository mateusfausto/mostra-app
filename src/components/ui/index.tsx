'use client'
import React from 'react'

// ── BUTTON ──────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'whatsapp'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles: Record<BtnVariant, string> = {
  primary: 'bg-gold text-ink hover:bg-gold-light',
  dark:    'bg-ink text-cream hover:bg-[#1a1a1a]',
  outline: 'bg-transparent text-cream border border-white/30 hover:border-gold hover:text-gold',
  ghost:   'bg-transparent text-ink border border-black/20 hover:border-ink',
  whatsapp:'bg-[#25D366] text-white hover:bg-[#20bd5a]',
}

export function Button({ variant = 'dark', fullWidth, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        px-5 py-3 rounded-[2px]
        font-dm text-xs font-medium tracking-widest uppercase
        transition-all duration-200
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

// ── INPUT ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-dm text-[10px] font-medium tracking-widest uppercase text-muted">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3.5 py-3
          bg-white border border-black/10 rounded-[2px]
          font-dm text-sm text-ink
          outline-none transition-colors
          focus:border-gold
          placeholder:text-muted
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

// ── TEXTAREA ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-dm text-[10px] font-medium tracking-widest uppercase text-muted">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3.5 py-3 min-h-[90px]
          bg-white border border-black/10 rounded-[2px]
          font-dm text-sm text-ink leading-relaxed
          outline-none transition-colors resize-y
          focus:border-gold
          placeholder:text-muted
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

// ── SELECT ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-dm text-[10px] font-medium tracking-widest uppercase text-muted">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3.5 py-3 pr-9
          bg-white border border-black/10 rounded-[2px]
          font-dm text-sm text-ink
          outline-none transition-colors
          focus:border-gold
          appearance-none
          bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%238a7d6e'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")]
          bg-no-repeat bg-[right_14px_center]
          ${className}
        `}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── TOAST ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`
        fixed bottom-24 left-1/2 z-50
        bg-ink text-cream
        px-5 py-3 rounded-full
        font-dm text-[13px] whitespace-nowrap
        pointer-events-none
        transition-all duration-300
        ${visible
          ? 'opacity-100 -translate-x-1/2 translate-y-0'
          : 'opacity-0 -translate-x-1/2 translate-y-4'
        }
      `}
    >
      {message}
    </div>
  )
}

// ── SKELETON ─────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2px] overflow-hidden">
      <div className="skeleton aspect-[3/4]" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-9 w-full rounded" />
      </div>
    </div>
  )
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
const statusStyles = {
  pendente: 'bg-yellow-50 text-yellow-800',
  ativo:    'bg-green-50 text-green-800',
  vendido:  'bg-gray-100 text-gray-600',
  removido: 'bg-red-50 text-red-700',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full
      font-dm text-[10px] font-medium
      ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-600'}
    `}>
      {status}
    </span>
  )
}
