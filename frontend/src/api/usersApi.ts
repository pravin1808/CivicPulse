import type { User } from '../types/user'
import { USE_MOCK_API } from './client'
import { mockApi } from './mockData'

export async function fetchUsers(): Promise<User[]> {
  if (USE_MOCK_API) {
    return mockApi.getUsers()
  }

  return []
}
