import { createContext } from 'react'
import type { Issue } from '../types/issue'
import type { Role } from '../types/role'
import type { User } from '../types/user'
import type { Worker } from '../types/worker'

export interface AppContextValue {
  role: Role
  setRole: (nextRole: Role) => void
  currentUser: User | null
  issues: Issue[]
  workers: Worker[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  assignIssue: (issueId: string, workerId: number) => Promise<void>
}

export const AppContext = createContext<AppContextValue | undefined>(undefined)
