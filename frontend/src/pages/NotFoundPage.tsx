import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="card">
      <h2>Page not found</h2>
      <p className="muted">
        The page you requested does not exist. Go back to <Link to="/">dashboard</Link>.
      </p>
    </section>
  )
}
