import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { StatCard } from '../../components/StatCard'
import { useAppContext } from '../../hooks/useAppContext'
import { StatusBadge } from '../../components/StatusBadge'

export function DefaultDashboardPage() {
  const { issues, loading, error } = useAppContext()

  const openIssues = issues.filter((issue) => issue.status !== 'RESOLVED').length
  const resolvedIssues = issues.filter((issue) => issue.status === 'RESOLVED').length

  return (
    <section>
      <h2>Default Dashboard</h2>
      <p className="muted">Quick overview and recent issue activity.</p>

      <div className="stats-grid">
        <StatCard title="Total Issues" value={issues.length} />
        <StatCard title="Open Issues" value={openIssues} />
        <StatCard title="Resolved Issues" value={resolvedIssues} />
      </div>

      <div className="card">
        <h3>Recent Issues</h3>
        {loading ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && issues.length === 0 ? <EmptyState message="No issues found." /> : null}

        {!loading && !error && issues.length > 0 ? (
          <ul className="simple-list">
            {issues.slice(0, 5).map((issue) => (
              <li key={issue.issueId}>
                <div>
                  <strong>{issue.title}</strong>
                  <p className="muted">{issue.issueId}</p>
                </div>
                <StatusBadge status={issue.status} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
