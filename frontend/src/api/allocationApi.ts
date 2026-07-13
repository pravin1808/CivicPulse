import type { IssueStatus } from '../types/issue'
import { apiRequest, USE_MOCK_API } from './client'
import { endpoints } from './endpoints'
import { mockApi } from './mockData'

interface AssignIssuePayload {
  workerId: number
  status: IssueStatus
}

export async function assignIssueToWorker(issueId: string, workerId: number, assignedBy: number) {
  if (USE_MOCK_API) {
    return mockApi.assignIssue(issueId, workerId, assignedBy)
  }

  return apiRequest(endpoints.assignIssue(issueId), {
    method: 'PATCH',
    body: JSON.stringify({ workerId, status: 'ASSIGNED' } as AssignIssuePayload),
  })
}
