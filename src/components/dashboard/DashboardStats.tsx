import type { DashboardStats as DashboardStatsType } from '../../types';
import StatTile from '../ui/StatTile';

type DashboardStatsProps = {
  readonly stats: DashboardStatsType;
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatTile label="Total Attempts" value={stats.total_attempts} />
      <StatTile label="Completed" value={stats.completed} />
      <StatTile label="Correct" value={stats.correct} />
      <StatTile label="Accuracy Rate" value={`${stats.accuracy_rate}%`} />
      <StatTile label="Total Score" value={stats.total_score} />
      <StatTile label="Avg Time" value={`${stats.average_time_seconds}s`} />
    </div>
  );
}
