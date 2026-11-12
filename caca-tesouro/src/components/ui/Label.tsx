import type { LabelHTMLAttributes } from 'react'
import { forwardRef } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required = false, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`label-field block text-sm font-medium text-slate-700 mb-1 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
    )
  }
)

Label.displayName = 'Label'