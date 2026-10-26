import { AlertCircle, LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading workspace data…" }: { label?: string }) {
  return (
    <div className="rewardor-state" role="status" aria-live="polite">
      <LoaderCircle className="rewardor-state-icon rewardor-spin" size={20} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rewardor-state rewardor-empty-state">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rewardor-state rewardor-error-state" role="alert">
      <AlertCircle className="rewardor-state-icon" size={20} aria-hidden="true" />
      <div><strong>Something needs attention</strong><span>{message}</span></div>
      {onRetry ? <button type="button" onClick={onRetry} className="rewardor-state-action">Try again</button> : null}
    </div>
  );
}
