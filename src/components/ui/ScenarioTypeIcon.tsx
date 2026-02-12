import type { ScenarioType } from '../../lib/types';
import { SCENARIO_TYPE_DISPLAY } from '../../lib/types';
import { FishSymbol, Unlink, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ScenarioTypeIconConfig = {
  readonly icon: LucideIcon;
  readonly className: string;
};

const SCENARIO_TYPE_ICONS: Record<ScenarioType, ScenarioTypeIconConfig> = {
  phishing_email: { icon: FishSymbol, className: 'text-info' },
  fake_profile: { icon: UserX, className: 'text-secondary' },
  malicious_link: { icon: Unlink, className: 'text-orange-500' },
};

type ScenarioTypeIconProps = {
  readonly type: ScenarioType;
  readonly className?: string;
};

export default function ScenarioTypeIcon({ type, className = 'h-5 w-5' }: ScenarioTypeIconProps) {
  const { icon: Icon, className: iconClassName } = SCENARIO_TYPE_ICONS[type];
  const label = SCENARIO_TYPE_DISPLAY[type];

  return (
    <div className="tooltip tooltip-left" data-tip={label}>
      <Icon className={`${className} ${iconClassName}`} />
    </div>
  );
}
