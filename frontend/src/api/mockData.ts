import type { Allocation } from '../types/allocation'
import type { Issue } from '../types/issue'
import type { Worker } from '../types/worker'
import type { User } from '../types/user'

const now = new Date().toISOString()

const users: User[] = [
  { id: 1, name: 'Aarav Admin', email: 'admin@civicpulse.local', role: 'ADMIN' },
  { id: 2, name: 'Wren Worker', email: 'worker@civicpulse.local', role: 'WORKER' },
  { id: 3, name: 'Ciya Citizen', email: 'citizen@civicpulse.local', role: 'CITIZEN' },
]

const workers: Worker[] = [
  {
    id: 2,
    name: 'Wren Worker',
    email: 'worker@civicpulse.local',
    role: 'WORKER',
    phoneNumber: '+91-9000000001',
    address: 'Ward 4, Central Zone',
    deptId: 101,
  },
  {
    id: 4,
    name: 'Ira Inspector',
    email: 'ira@civicpulse.local',
    role: 'WORKER',
    phoneNumber: '+91-9000000002',
    address: 'Ward 8, West Zone',
    deptId: 101,
  },
]

let issues: Issue[] = [
  {
    issueId: 'ISS-1001',
    title: 'Streetlight not working',
    description: 'Streetlight near community hall is off for 3 nights.',
    status: 'ASSIGNED',
    latitude: 13.0827,
    longitude: 80.2707,
    createdAt: now,
    updatedAt: now,
    department: 101,
    category: 1,
    citizenId: 3,
    citizenName: 'Ciya Citizen',
    assignedWorkerId: 2,
  },
  {
    issueId: 'ISS-1002',
    title: 'Garbage collection delay',
    description: 'Waste bins are overflowing on Market Road.',
    status: 'PENDING',
    latitude: 13.0611,
    longitude: 80.2372,
    createdAt: now,
    updatedAt: now,
    department: 101,
    category: 2,
    citizenId: 3,
    citizenName: 'Ciya Citizen',
  },
  {
    issueId: 'ISS-1003',
    title: 'Pothole near school',
    description: 'Large pothole causing traffic and safety risk.',
    status: 'IN_PROGRESS',
    latitude: 13.0671,
    longitude: 80.257,
    createdAt: now,
    updatedAt: now,
    department: 102,
    category: 3,
    citizenId: 5,
    citizenName: 'Nila Resident',
    assignedWorkerId: 4,
  },
]

let allocations: Allocation[] = [
  {
    issueId: 'ISS-1001',
    workerId: 2,
    assignedAt: now,
    assignedBy: 1,
  },
  {
    issueId: 'ISS-1003',
    workerId: 4,
    assignedAt: now,
    assignedBy: 1,
  },
]

const wait = async () => new Promise((resolve) => setTimeout(resolve, 250))

export const mockApi = {
  async getUsers() {
    await wait()
    return [...users]
  },
  async getWorkers() {
    await wait()
    return [...workers]
  },
  async getAllIssues() {
    await wait()
    return [...issues]
  },
  async getWorkerIssues(workerId: number) {
    await wait()
    return issues.filter((issue) => issue.assignedWorkerId === workerId)
  },
  async getCitizenIssues(citizenId: number) {
    await wait()
    return issues.filter((issue) => issue.citizenId === citizenId)
  },
  async assignIssue(issueId: string, workerId: number, assignedBy: number) {
    await wait()
    issues = issues.map((issue) => {
      if (issue.issueId !== issueId) {
        return issue
      }

      return {
        ...issue,
        assignedWorkerId: workerId,
        status: 'ASSIGNED',
        updatedAt: new Date().toISOString(),
      }
    })

    allocations = [
      ...allocations.filter((allocation) => allocation.issueId !== issueId),
      {
        issueId,
        workerId,
        assignedAt: new Date().toISOString(),
        assignedBy,
      },
    ]

    const updatedIssue = issues.find((issue) => issue.issueId === issueId)
    if (!updatedIssue) {
      throw new Error('Issue not found')
    }

    return updatedIssue
  },
}
