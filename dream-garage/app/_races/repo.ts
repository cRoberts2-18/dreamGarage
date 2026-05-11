const API_URL = 'http://localhost:6767'

export type SaveRacePayload = {
  eventId: number
  userCardId: number
  opponentCardId: number
  result: 'win' | 'loss'
  userTime: number
  opponentTime: number
}

export const saveRace = async (payload: SaveRacePayload): Promise<void> => {
  const token = localStorage.getItem('access-token') || ''
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : {}

  const headers = new Headers()
  headers.set('Authorization', token)

  await fetch(`${API_URL}/races`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId: user.id, ...payload })
  })
}
