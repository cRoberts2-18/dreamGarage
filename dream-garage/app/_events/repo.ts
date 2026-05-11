import { card } from '@/app/_cards/repo'

const API_URL = 'http://localhost:6767'

export type RaceEvent = {
  id: number
  name: string
  type: 'drag' | 'circuit' | 'rally'
}

export type Opponent = {
  card: card
  difficulty: number
}

const authHeader = () => {
  const token = localStorage.getItem('access-token') || ''
  const headers = new Headers()
  headers.set('Authorization', token)
  return headers
}

export const getEvents = async (): Promise<RaceEvent[]> => {
  const res = await fetch(`${API_URL}/events`, { headers: authHeader() })
  const data = await res.json()
  if (data.status === 401) document.location.href = '/login'
  return data.data ?? []
}

export const getOpponent = async (eventId: number): Promise<Opponent | null> => {
  const res = await fetch(`${API_URL}/events/${eventId}/opponent`, { headers: authHeader() })
  const data = await res.json()
  if (data.status === 401) document.location.href = '/login'
  return data.data ?? null
}
