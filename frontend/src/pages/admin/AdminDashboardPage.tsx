import { useMemo, useState } from 'react'
import { IssueTable } from '../../components/IssueTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { StatCard } from '../../components/StatCard'
import { WorkerList } from '../../components/WorkerList'
import { useAppContext } from '../../hooks/useAppContext'

export function AdminDashboardPage() {
  const { issues, workers, loading, error, assignIssue } = useAppContext()
  const [selectedWorkerByIssue, setSelectedWorkerByIssue] = useState<Record<string, number>>({})
  const [assigningIssueId, setAssigningIssueId] = useState<string | null>(null)

  const assignedCount = useMemo(
    () => issues.filter((issue) => typeof issue.assignedWorkerId === 'number').length,
    [issues],
  )

  const handleAssign = async (issueId: string) => {
    const workerId = selectedWorkerByIssue[issueId]
    if (!workerId) {
      return
    }

    setAssigningIssueId(issueId)
    await assignIssue(issueId, workerId)
    setAssigningIssueId(null)
  }

  return (
    <section>
      <h2>Admin Dashboard</h2>
      <p className="muted">Monitor issues, review workers, and allocate work directly.</p>

      <div className="stats-grid">
        <StatCard title="Issues" value={issues.length} />
        <StatCard title="Workers" value={workers.length} />
        <StatCard title="Assigned" value={assignedCount} />
      </div>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && issues.length === 0 ? <EmptyState message="No issues available." /> : null}

      {!loading && !error && issues.length > 0 ? (
        <IssueTable
          issues={issues}
          workers={workers}
          showAssignment
          selectedWorkerByIssue={selectedWorkerByIssue}
          assigningIssueId={assigningIssueId}
          onWorkerSelect={(issueId, workerId) =>
            setSelectedWorkerByIssue((current) => ({ ...current, [issueId]: workerId }))
          }
          onAssign={handleAssign}
        />
      ) : null}

      {!loading && !error && workers.length > 0 ? <WorkerList workers={workers} /> : null}
    </section>
  )
}
