export function LoadingState() {
  return <p className="state-message">Loading data...</p>
}

export function ErrorState({ message }: { message: string }) {
  return <p className="state-message error">{message}</p>
}

export function EmptyState({ message }: { message: string }) {
  return <p className="state-message">{message}</p>
}
