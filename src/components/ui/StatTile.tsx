import type { LucideIcon } from 'lucide-react';

type StatTileProps = {
  readonly label: string;
  readonly value: string | number;
  readonly helper?: string;
  readonly icon?: LucideIcon;
};

export default function StatTile({ label, value, helper, icon: Icon }: StatTileProps) {
  return (
    <div className="card rounded-2xl border border-base-200 bg-base-100/90 shadow-sm ring-1 ring-base-200/50">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
              {label}
            </p>
            <p className="text-3xl font-semibold text-base-content">{value}</p>
            {helper && <p className="text-sm text-base-content/60">{helper}</p>}
          </div>
          {Icon && (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-base-200 text-primary">
              <Icon className="h-5 w-5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
