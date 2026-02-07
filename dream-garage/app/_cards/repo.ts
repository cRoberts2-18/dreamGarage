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
