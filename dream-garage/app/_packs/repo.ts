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
