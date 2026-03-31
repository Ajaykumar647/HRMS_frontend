export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      {description && <p className="empty-desc">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <p className="error-title">Something went wrong</p>
      <p className="error-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Try Again
        </button>
      )}
    </div>
  );
}
