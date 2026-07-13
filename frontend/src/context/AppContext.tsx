import { useCallback, useEffect, useMemo, useState } from 'react'
import { assignIssueToWorker } from '../api/allocationApi'
import { fetchAllIssues, fetchCitizenIssues, fetchWorkerIssues } from '../api/issuesApi'
import { fetchUsers } from '../api/usersApi'
import { fetchWorkers } from '../api/workersApi'
import type { Issue } from '../types/issue'
import type { Role } from '../types/role'
import type { User } from '../types/user'
import type { Worker as AppWorker } from '../types/worker'
import { AppContext } from './appContextStore'

const rolePriority: Role[] = ['ADMIN', 'WORKER', 'CITIZEN']

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('ADMIN')
  const [users, setUsers] = useState<User[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [workers, setWorkers] = useState<AppWorker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentUser = useMemo(() => users.find((user) => user.role === role) ?? null, [role, users])

  const hydrateData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fetchedUsers = await fetchUsers()
      const selectedUser = fetchedUsers.find((user) => user.role === role)
      if (!selectedUser) {
        throw new Error(`No user profile found for role ${role}`)
      }

      setUsers(fetchedUsers)

      if (role === 'ADMIN') {
        const [adminIssues, adminWorkers] = await Promise.all([fetchAllIssues(), fetchWorkers()])
        setIssues(adminIssues)
        setWorkers(adminWorkers)
      } else if (role === 'WORKER') {
        const [workerIssues, adminWorkers] = await Promise.all([
          fetchWorkerIssues(selectedUser.id),
          fetchWorkers(),
        ])
        setIssues(workerIssues)
        setWorkers(adminWorkers)
      } else {
        const citizenIssues = await fetchCitizenIssues(selectedUser.id)
        setIssues(citizenIssues)
        setWorkers([])
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data')
      setIssues([])
      setWorkers([])
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    void hydrateData()
  }, [hydrateData])

  const refreshData = useCallback(async () => {
    await hydrateData()
  }, [hydrateData])

  const assignIssue = useCallback(
    async (issueId: string, workerId: number) => {
      if (!currentUser) {
        throw new Error('Missing logged in user')
      }

      setLoading(true)
      setError(null)

      try {
        await assignIssueToWorker(issueId, workerId, currentUser.id)
        await hydrateData()
      } catch (assignError) {
        setError(assignError instanceof Error ? assignError.message : 'Issue assignment failed')
      } finally {
        setLoading(false)
      }
    },
    [currentUser, hydrateData],
  )

  const orderedUsers = useMemo(
    () => [...users].sort((a, b) => rolePriority.indexOf(a.role) - rolePriority.indexOf(b.role)),
    [users],
  )

  const value = useMemo(
    () => ({
      role,
      setRole,
      currentUser: currentUser ?? orderedUsers.find((user) => user.role === role) ?? null,
      issues,
      workers,
      loading,
      error,
      refreshData,
      assignIssue,
    }),
    [assignIssue, currentUser, error, issues, loading, orderedUsers, refreshData, role, workers],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
