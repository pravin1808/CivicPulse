export type IssueStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'

export interface Issue {
  issueId: string
  title: string
  description: string
  status: IssueStatus
  latitude: number
  longitude: number
  createdAt: string
  updatedAt?: string
  department: number
  category: number
  citizenId: number
  citizenName: string
  assignedWorkerId?: number
}
