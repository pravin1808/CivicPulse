import { IssueTable } from '../../components/IssueTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { useAppContext } from '../../hooks/useAppContext'

export function WorkerDashboardPage() {
  const { issues, loading, error } = useAppContext()

  return (
    <section>
      <h2>Worker Dashboard</h2>
      <p className="muted">Track and update issues assigned to you.</p>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && issues.length === 0 ? (
        <EmptyState message="No assigned issues right now." />
      ) : null}
      {!loading && !error && issues.length > 0 ? <IssueTable issues={issues} /> : null}
    </section>
  )
}
