import type { Issue } from '../types/issue'
import { apiRequest, USE_MOCK_API } from './client'
import { endpoints } from './endpoints'
import { mockApi } from './mockData'

export async function fetchAllIssues(): Promise<Issue[]> {
  if (USE_MOCK_API) {
    return mockApi.getAllIssues()
  }

  return apiRequest<Issue[]>(endpoints.adminIssues)
}

export async function fetchWorkerIssues(workerId: number): Promise<Issue[]> {
  if (USE_MOCK_API) {
    return mockApi.getWorkerIssues(workerId)
  }

  return apiRequest<Issue[]>(`${endpoints.workerIssues}?workerId=${workerId}`)
}

export async function fetchCitizenIssues(citizenId: number): Promise<Issue[]> {
  if (USE_MOCK_API) {
    return mockApi.getCitizenIssues(citizenId)
  }

  return apiRequest<Issue[]>(`${endpoints.citizenIssues}?citizenId=${citizenId}`)
}
