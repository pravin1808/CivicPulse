import type { Issue } from '../types/issue'
import type { Worker } from '../types/worker'
import { formatDateTime } from '../utils/date'
import { StatusBadge } from './StatusBadge'

interface IssueTableProps {
  issues: Issue[]
  workers?: Worker[]
  showAssignment?: boolean
  selectedWorkerByIssue?: Record<string, number>
  onWorkerSelect?: (issueId: string, workerId: number) => void
  onAssign?: (issueId: string) => void
  assigningIssueId?: string | null
}

export function IssueTable({
  issues,
  workers = [],
  showAssignment = false,
  selectedWorkerByIssue = {},
  onWorkerSelect,
  onAssign,
  assigningIssueId,
}: IssueTableProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Citizen</th>
            <th>Updated</th>
            {showAssignment ? <th>Assign Worker</th> : null}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.issueId}>
              <td>{issue.issueId}</td>
              <td>
                <strong>{issue.title}</strong>
                <p className="muted text-wrap">{issue.description}</p>
              </td>
              <td>
                <StatusBadge status={issue.status} />
              </td>
              <td>{issue.citizenName}</td>
              <td>{formatDateTime(issue.updatedAt ?? issue.createdAt)}</td>
              {showAssignment ? (
                <td>
                  <div className="assign-control">
                    <select
                      value={selectedWorkerByIssue[issue.issueId] ?? issue.assignedWorkerId ?? ''}
                      onChange={(event) => onWorkerSelect?.(issue.issueId, Number(event.target.value))}
                    >
                      <option value="">Select worker</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => onAssign?.(issue.issueId)}
                      disabled={assigningIssueId === issue.issueId}
                    >
                      {assigningIssueId === issue.issueId ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
