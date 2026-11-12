import { QRCodeSVG } from 'qrcode.react'

export interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
  showValue?: boolean
}

export function QRCodeDisplay({ value, size = 160, className = '', showValue = false }: QRCodeDisplayProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <QRCodeSVG value={value} size={size} />
      </div>
      {showValue && <span className="font-mono text-sm text-slate-600 break-all text-center">{value}</span>}
    </div>
  )
}