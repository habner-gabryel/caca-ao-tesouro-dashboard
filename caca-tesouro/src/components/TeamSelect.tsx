import type { ChangeEvent } from 'react'
import { Select } from './ui/Select'
import type { Team } from '../types'

export interface TeamSelectProps {
  teams: Team[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
}

export function TeamSelect({ teams, value, onChange, placeholder = 'Escolha uma equipe', disabled = false, error, label = 'Selecione sua equipe' }: TeamSelectProps) {
  const activeTeams = teams.filter((team) => team.ativo)

  return (
    <Select
      label={label}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      options={activeTeams.map((team) => ({ value: team.id, label: team.nome }))}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
    />
  )
}