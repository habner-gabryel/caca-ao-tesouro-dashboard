export type Team = {
  id: string
  nome: string
  ativo: boolean
}

export type QrType = 'dica' | 'meme'

export type QrDocument = {
  id: string
  tipo: QrType
  local?: string
  canalRadio?: string
  dicaTexto?: string
  memeUrl?: string
  ativo: boolean
}

export type AccessRecord = {
  id: string
  qrId: string
  equipeId: string
  equipeNome: string
  origem: 'qr' | 'manual'
  timestamp: string
}

export const initialTeams: Team[] = [
  { id: 'equipe-1', nome: 'Equipe Azul', ativo: true },
  { id: 'equipe-2', nome: 'Equipe Verde', ativo: true },
  { id: 'equipe-3', nome: 'Equipe Amarela', ativo: true },
  { id: 'equipe-4', nome: 'Equipe Vermelha', ativo: false },
]

export const initialQrPublic: QrDocument[] = [
  {
    id: 'QR001',
    tipo: 'dica',
    local: 'Praça central',
    canalRadio: 'Canal 2',
    dicaTexto: 'Procure o ponto de luz azul e siga o caminho do relógio.',
    ativo: true,
  },
  {
    id: 'QR002',
    tipo: 'meme',
    local: 'Biblioteca',
    memeUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    ativo: true,
  },
  {
    id: 'QR003',
    tipo: 'dica',
    local: 'Auditório',
    canalRadio: 'Canal 4',
    dicaTexto: 'A chave está sob a escultura mais alta.',
    ativo: true,
  },
]

export const initialAccesses: AccessRecord[] = [
  {
    id: 'acc-1',
    qrId: 'QR001',
    equipeId: 'equipe-1',
    equipeNome: 'Equipe Azul',
    origem: 'qr',
    timestamp: '2026-11-11T19:15:00.000Z',
  },
  {
    id: 'acc-2',
    qrId: 'QR002',
    equipeId: 'equipe-2',
    equipeNome: 'Equipe Verde',
    origem: 'manual',
    timestamp: '2026-11-11T19:20:00.000Z',
  },
]
