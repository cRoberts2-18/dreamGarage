const API_URL = 'http://localhost:6767'

export type TradeItemDetail = {
  userCardId: number | null
  cardId: number
  name: string
  image: string
  rating: string
  offeredByUserId: number
}

export type TradeDetail = {
  id: number
  status: string
  initiatorId: number
  initiatorUsername: string
  recipientId: number
  recipientUsername: string
  pendingUserId: number
  initiatorCards: TradeItemDetail[]
  recipientCards: TradeItemDetail[]
  createdAt: string
  updatedAt: string
}

function authHeaders(): Headers {
  const header = new Headers()
  header.set('Authorization', localStorage.getItem('access-token') || '')
  return header
}

function currentUserId(): number {
  const userString = localStorage.getItem('user')
  return userString ? JSON.parse(userString).id : 0
}

export const createTrade = async (
  recipientId: number,
  offeredCardIds: number[],
  requestedCardIds: number[]
): Promise<string | null> => {
  const response = await fetch(`${API_URL}/trades`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId(), recipientId, offeredCardIds, requestedCardIds }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}

export const getActiveTrades = async (): Promise<TradeDetail[]> => {
  const response = await fetch(`${API_URL}/trades/active`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.data ?? []
}

export const getTradeHistory = async (): Promise<TradeDetail[]> => {
  const response = await fetch(`${API_URL}/trades/history`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.data ?? []
}

export const acceptTrade = async (tradeId: number): Promise<string | null> => {
  const response = await fetch(`${API_URL}/trades/${tradeId}/accept`, {
    method: 'PUT',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}

export const rejectTrade = async (tradeId: number): Promise<string | null> => {
  const response = await fetch(`${API_URL}/trades/${tradeId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}

export const cancelTrade = async (tradeId: number): Promise<string | null> => {
  const response = await fetch(`${API_URL}/trades/${tradeId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}

export const counterTrade = async (
  tradeId: number,
  newOfferedCardIds: number[],
  newRequestedCardIds: number[]
): Promise<string | null> => {
  const response = await fetch(`${API_URL}/trades/${tradeId}/counter`, {
    method: 'PUT',
    body: JSON.stringify({ userId: currentUserId(), newOfferedCardIds, newRequestedCardIds }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}
