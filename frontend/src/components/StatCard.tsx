export function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <article className="card stat-card">
      <p className="card-label">{title}</p>
      <h3>{value}</h3>
    </article>
  )
}
