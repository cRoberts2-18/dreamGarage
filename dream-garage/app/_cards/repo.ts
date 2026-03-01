const API_URL = 'http://localhost:6767'

export type card = {
  name: string
  image: string
  rating: string
  topSpeed: number
  horsepower: number
  handling: number
  engine: string
  packId: number
  id: number
}

export const getCards = async (): Promise<card[]> => {
  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const res = await fetch(`${API_URL}/cards`, {
    cache: 'default',
    headers: header
  })

  const data = await res.json()
  if (data.status == 401) {
    document.location.href = '/login'
  }
  return data.data
}

export const sellCard = async (cardId: number, quantity: number): Promise<{ points: number; pointsEarned: number } | null> => {
  const userString = localStorage.getItem('user')
  const userObject = userString ? JSON.parse(userString) : {}

  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const options = {
    method: 'POST',
    body: JSON.stringify({ userId: userObject.id, cardId, quantity }),
    headers: header
  }

  const response = await fetch(`${API_URL}/cards/sell`, options).then((r) => r.json())

  if (response.status === 200) {
    localStorage.setItem('user', JSON.stringify({ ...userObject, points: response.data.points }))
    return response.data
  }

  return null
}

export const getDreamGarage = async (): Promise<number[]> => {
  const userString = localStorage.getItem('user')
  const userObject = userString ? JSON.parse(userString) : {}
  const userId = userObject?.id

  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const response = await fetch(`${API_URL}/user/dream-garage`, {
    method: 'POST',
    body: JSON.stringify({ id: userId }),
    headers: header
  }).then((r) => r.json())

  return response.data ?? []
}

export const updateDreamGarage = async (cardIds: number[]): Promise<boolean> => {
  const userString = localStorage.getItem('user')
  const userObject = userString ? JSON.parse(userString) : {}
  const userId = userObject?.id

  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const response = await fetch(`${API_URL}/user/dream-garage`, {
    method: 'PUT',
    body: JSON.stringify({ id: userId, cardIds }),
    headers: header
  }).then((r) => r.json())

  return response.status === 200
}

export const getOwnedCards = async () => {
  const userString = localStorage.getItem('user')
  const userObject = userString ? JSON.parse(userString) : {}

  const userId = userObject?.id

  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const options = {
    method: 'POST',
    body: `{"id":${userId}}`,
    headers: header
  }

  const response = await fetch(`${API_URL}/cards/owned`, options).then(
    (response) => response.json()
  )

  return response.data
}
