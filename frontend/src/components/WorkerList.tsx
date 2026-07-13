import type { Worker } from '../types/worker'

export function WorkerList({ workers }: { workers: Worker[] }) {
  return (
    <div className="card">
      <h3>Workers</h3>
      <ul className="simple-list">
        {workers.map((worker) => (
          <li key={worker.id}>
            <strong>{worker.name}</strong>
            <span className="muted">{worker.email}</span>
            <span className="muted">Dept: {worker.deptId}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
