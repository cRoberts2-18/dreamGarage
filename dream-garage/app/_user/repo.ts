const API_URL = 'http://localhost:6767'

export type user = {
  id: number
  username: string
  email: number
  password: string
  points: number
}

export const signUp = async (
  username: string | null,
  email: string | null,
  password: string | null
): Promise<string | void> => {
  const options = {
    method: 'POST',
    body: `{"username":"${username}","email":"${email}","password":"${password}"}`
  }

  const response = await fetch(`${API_URL}/user/create`, options).then((r) =>
    r.json()
  )

  if (response.status == 200) {
    return login(username, password)
  }

  return response.message
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
    const user = {
      ...token.data.user,
      last_active: token.data.user.last_active?.Valid
        ? token.data.user.last_active?.Time
        : null
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('access-token', token.data.token)
    document.location.href = '/'
    return
  }

  return token.message
}

export const updatePoints = async (
  points: number,
  id: number,
  streak: number
) => {
  const token = localStorage.getItem('access-token') || ''
  const header = new Headers()
  header.set('Authorization', token)

  const options = {
    method: 'POST',
    body: `{"points":"${points}", "id":"${id}", "streak":"${streak}"}`,
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
