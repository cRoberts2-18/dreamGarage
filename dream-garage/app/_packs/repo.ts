import { card } from '../_cards/repo'

const API_URL = 'http://localhost:6767'

export type pack = {
  id: number
  name: string
  price: number
  image: string
  featured: boolean
}

export const getPacks = async (): Promise<pack[]> => {
  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const res = await fetch(`${API_URL}/packs`, {
    cache: 'default',
    headers: header
  })

  const data = await res.json()
  if (data.status == 401) {
    document.location.href = '/login'
  }

  return data.data
}

export const purchasePack = async (
  packId: number,
  price: number
): Promise<card[] | string> => {
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

  const response = await fetch(
    `${API_URL}/packs/${packId}/purchase`,
    options
  ).then((response) => response.json())

  if (!response.data) {
    return response.message
  } else {
    const userString = localStorage.getItem('user')
    const userObject = userString ? JSON.parse(userString) : {}

    localStorage.setItem(
      'user',
      JSON.stringify({ ...userObject, points: userObject.points - price })
    )

    return response.data
  }
}
