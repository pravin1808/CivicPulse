import type { IssueStatus } from '../types/issue'

const statusClassMap: Record<IssueStatus, string> = {
  PENDING: 'status status-pending',
  ASSIGNED: 'status status-assigned',
  IN_PROGRESS: 'status status-progress',
  RESOLVED: 'status status-resolved',
  REJECTED: 'status status-rejected',
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <span className={statusClassMap[status]}>{status.replace('_', ' ')}</span>
}
