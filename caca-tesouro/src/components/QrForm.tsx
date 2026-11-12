import { useState } from 'react'
import type { FormEvent } from 'react'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Label } from './ui/Label'
import { Button } from './ui/Button'
import type { FormState } from '../types'

export interface QrFormProps {
  initialData?: Partial<FormState>
  onSubmit: (data: FormState) => void
  submitLabel?: string
  notice?: string
}

export function QrForm({ initialData, onSubmit, submitLabel = 'Salvar QR', notice }: QrFormProps) {
  const [form, setForm] = useState<FormState>({
    id: '',
    tipo: 'dica',
    local: 'Pátio',
    canalRadio: 'Canal 3',
    dicaTexto: 'A pista está no ponto mais alto da área central.',
    memeUrl: '',
    ativo: true,
    ...initialData,
  })

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="ID do QR"
        id="qrId"
        value={form.id}
        onChange={(e) => handleChange('id', e.target.value)}
        placeholder="QR001"
      />

      <div>
        <Label htmlFor="tipo">Tipo</Label>
        <Select
          id="tipo"
          value={form.tipo}
          onChange={(e) => handleChange('tipo', e.target.value as 'dica' | 'meme')}
          options={[
            { value: 'dica', label: 'Dica' },
            { value: 'meme', label: 'Meme' },
          ]}
        />
      </div>

      {form.tipo === 'dica' ? (
        <>
          <Input
            label="Canal de rádio"
            id="canalRadio"
            value={form.canalRadio}
            onChange={(e) => handleChange('canalRadio', e.target.value)}
            placeholder="Canal 1"
          />
          <div>
            <Label htmlFor="dicaTexto">Texto da dica</Label>
            <textarea
              id="dicaTexto"
              className="input-field min-h-[120px] resize-y p-3 w-full"
              value={form.dicaTexto}
              onChange={(e) => handleChange('dicaTexto', e.target.value)}
              placeholder="Descreva a dica..."
            />
          </div>
        </>
      ) : (
        <Input
          label="URL do meme"
          id="memeUrl"
          type="url"
          value={form.memeUrl}
          onChange={(e) => handleChange('memeUrl', e.target.value)}
          placeholder="https://exemplo.com/meme.jpg"
        />
      )}

      <Input
        label="Local/descrição"
        id="local"
        value={form.local}
        onChange={(e) => handleChange('local', e.target.value)}
        placeholder="Pátio, Auditório, etc."
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativo"
          checked={form.ativo}
          onChange={(e) => handleChange('ativo', e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
        />
        <Label htmlFor="ativo" className="mb-0 cursor-pointer text-nav">
          QR ativo
        </Label>
      </div>

      <Button type="submit" fullWidth size="lg">
        {submitLabel}
      </Button>

      {notice && <p className="success-text text-center">{notice}</p>}
    </form>
  )
}