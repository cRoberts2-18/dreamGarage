const API_URL = 'http://localhost:6767'

export type user = {
  id: number
  username: string
  email: number
  password: string
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
    localStorage.setItem('access-token', token.data.token)
    document.location.href = '/'
    return
  }

  return token.message
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
