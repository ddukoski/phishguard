import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export default function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="card rounded-2xl border border-base-200 bg-base-100/90 shadow-sm ring-1 ring-base-200/50">
      <div className="card-body items-center text-center">
        {Icon && (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 text-primary">
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-base-content/70">{description}</p>}
        </div>
        {action && <div className="pt-4">{action}</div>}
      </div>
    </div>
  );
}
