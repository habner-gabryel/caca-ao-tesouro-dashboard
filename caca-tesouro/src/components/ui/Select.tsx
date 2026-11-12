import type { SelectHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label-field block mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`input-field w-full ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="error-text mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'