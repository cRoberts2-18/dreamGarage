const API_URL = 'http://localhost:6767'

export type pack = {
  id: number
  name: string
  price: number
  image: string
  featured: boolean
}

export const getPacks = async (): Promise<pack[]> => {
  const options = {
    method: 'POST',
    body: '{"username":"admin","password":"password"}'
  }

  const token = await fetch(`${API_URL}/token`, options).then((response) =>
    response.json()
  )

  const header = new Headers()
  header.set('Authorization', token.data.token)

  const res = await fetch(`${API_URL}/packs`, {
    cache: 'default',
    headers: header
  })

  const data = await res.json()

  return data.data
}
