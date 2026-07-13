import { IssueTable } from '../../components/IssueTable'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { useAppContext } from '../../hooks/useAppContext'

export function UserDashboardPage() {
  const { issues, loading, error } = useAppContext()

  return (
    <section>
      <h2>User Dashboard</h2>
      <p className="muted">View all issues submitted by you and their current status.</p>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && issues.length === 0 ? <EmptyState message="No submitted issues yet." /> : null}
      {!loading && !error && issues.length > 0 ? <IssueTable issues={issues} /> : null}
    </section>
  )
}
