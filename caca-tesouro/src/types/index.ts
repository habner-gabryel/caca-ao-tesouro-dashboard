export type FormState = {
  id: string
  tipo: 'dica' | 'meme'
  local: string
  canalRadio: string
  dicaTexto: string
  memeUrl: string
  ativo: boolean
}

export const defaultForm: FormState = {
  id: 'QR004',
  tipo: 'dica',
  local: 'Pátio',
  canalRadio: 'Canal 3',
  dicaTexto: 'A pista está no ponto mais alto da área central.',
  memeUrl: '',
  ativo: true,
}

export type QrDocument = {
  id: string
  tipo: 'dica' | 'meme'
  local?: string
  canalRadio?: string
  dicaTexto?: string
  memeUrl?: string
  ativo: boolean
}

export type Team = {
  id: string
  nome: string
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