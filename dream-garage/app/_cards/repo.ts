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
  const options = {
    method: 'POST',
    body: '{"username":"admin","password":"password"}'
  }

  const token = await fetch(`${API_URL}/token`, options).then((response) =>
    response.json()
  )

  const header = new Headers()
  header.set('Authorization', token.data.token)

  const res = await fetch(`${API_URL}/cards`, {
    cache: 'default',
    headers: header
  })

  const data = await res.json()

  return data.data
}
