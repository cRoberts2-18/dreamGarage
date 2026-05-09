const API_URL = 'http://localhost:6767'

export type FriendRequests = {
  incoming: FriendInfo[]
  outgoing: FriendInfo[]
}

export type FriendInfo = {
  friendshipId: number
  friendId: number
  username?: string
  requesterUsername?: string
  addresseeUsername?: string
  status: string
}

export type FriendDreamGarage = {
  dreamGarage: number[]
  username: string
}

function authHeaders(): Headers {
  const header = new Headers()
  header.set('Authorization', localStorage.getItem('access-token') || '')
  return header
}

function currentUserId(): number {
  const userString = localStorage.getItem('user')
  return userString ? JSON.parse(userString).id : 0
}

export const sendFriendRequest = async (
  targetUsername: string
): Promise<string | null> => {
  const response = await fetch(`${API_URL}/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId(), targetUsername }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return null
  return response.message
}

export const getFriendRequests = async (): Promise<FriendRequests> => {
  const response = await fetch(`${API_URL}/friends/requests`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.data
    ? {
        incoming: response.data.filter(
          (request: FriendInfo) => request.friendId !== currentUserId()
        ),
        outgoing: response.data.filter(
          (request: FriendInfo) => request.friendId == currentUserId()
        )
      }
    : { incoming: [], outgoing: [] }
}

export const respondToFriendRequest = async (
  friendshipId: number,
  action: 'accept' | 'reject'
): Promise<boolean> => {
  const response = await fetch(`${API_URL}/friends/request/${friendshipId}`, {
    method: 'PUT',
    body: JSON.stringify({ userId: currentUserId(), action }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.status === 200
}

export const getFriends = async (): Promise<FriendInfo[]> => {
  const response = await fetch(`${API_URL}/friends`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())
  console.log(response.data)
  return response.data ?? []
}

export const removeFriend = async (friendshipId: number): Promise<boolean> => {
  const response = await fetch(`${API_URL}/friends/${friendshipId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.status === 200
}

export const getFriendCards = async (friendId: number): Promise<number[]> => {
  const response = await fetch(`${API_URL}/friends/${friendId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  return response.data ?? []
}

export const getFriendDreamGarage = async (
  friendId: number
): Promise<FriendDreamGarage | null> => {
  const response = await fetch(`${API_URL}/friends/${friendId}/dream-garage`, {
    method: 'POST',
    body: JSON.stringify({ userId: currentUserId() }),
    headers: authHeaders()
  }).then((r) => r.json())

  if (response.status === 200) return response.data
  return null
}
