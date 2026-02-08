import type { ReactNode } from 'react';

type SectionCardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function SectionCard({ title, description, actions, children }: SectionCardProps) {
  return (
    <div className="card rounded-2xl border border-base-200 bg-base-100/90 shadow-sm ring-1 ring-base-200/50">
      <div className="card-body gap-4">
        {(title || actions) && (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              {title && <h2 className="card-title text-base">{title}</h2>}
              {description && <p className="text-sm text-base-content/60">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
