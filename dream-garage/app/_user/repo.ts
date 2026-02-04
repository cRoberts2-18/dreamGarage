const API_URL = 'http://localhost:6767'

export type user = {
  id: number
  username: string
  email: number
  password: string
  points: number
}

export const login = async (
  username: string | null,
  password: string | null
): Promise<string | void> => {
  const options = {
    method: 'POST',
    body: `{"username":"${username}","password":"${password}"}`
  }

  const token = await fetch(`${API_URL}/token`, options).then((response) =>
    response.json()
  )

  if (token.status == 200) {
    localStorage.setItem('user', JSON.stringify(token.data.user))
    localStorage.setItem('access-token', token.data.token)
    document.location.href = '/'
    return
  }

  return token.message
}

export const updatePoints = async (points: number, id: number) => {
  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const options = {
    method: 'POST',
    body: `{"points":"${points}", "id":"${id}"}`,
    headers: header
  }

  const response = await fetch(`${API_URL}/user/points`, options).then(
    (response) => response.json()
  )

  const userString = localStorage.getItem('user')
  const userObject = userString ? JSON.parse(userString) : {}

  const user = { ...userObject, ...response.data }
  localStorage.setItem('user', JSON.stringify({ ...user, ...response.data }))
  return user
}

// export const getPacks = async (): Promise<pack[]> => {
//   const options = {
//     method: 'POST',
//     body: '{"username":"admin","password":"password"}'
//   }

//   const token = await fetch(`${API_URL}/token`, options).then((response) =>
//     response.json()
//   )

//   const header = new Headers()
//   header.set('Authorization', token.data.token)

//   const res = await fetch(`${API_URL}/packs`, {
//     cache: 'default',
//     headers: header
//   })

//   const data = await res.json()

//   return data.data
// }
