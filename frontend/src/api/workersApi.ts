import type { Worker } from '../types/worker'
import { apiRequest, USE_MOCK_API } from './client'
import { endpoints } from './endpoints'
import { mockApi } from './mockData'

export async function fetchWorkers(): Promise<Worker[]> {
  if (USE_MOCK_API) {
    return mockApi.getWorkers()
  }

  return apiRequest<Worker[]>(endpoints.adminWorkers)
}
