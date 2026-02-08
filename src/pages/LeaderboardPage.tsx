import { useEffect, useState } from 'react';
import { Medal, Trophy } from 'lucide-react';
import api from '../lib/api';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';

type LeaderboardEntry = {
  readonly username: string;
  readonly avatar?: string;
  readonly total_score: number;
  readonly total_correct: number;
  readonly total_attempts: number;
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/progress/leaderboard')
      .then((res) => setEntries(res.data.leaderboard))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading leaderboard" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leaderboard"
        description="See who is leading the threat detection scoreboard."
        icon={Trophy}
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No leaderboard data yet"
          description="Complete scenarios to appear on the leaderboard."
        />
      ) : (
        <SectionCard>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={`${entry.username}-${index}`}
                    className={index < 3 ? 'bg-base-200/50' : ''}
                  >
                    <td>
                      <div className="flex items-center gap-2 font-semibold">
                        {index < 3 ? (
                          <>
                            {index === 0 ? (
                              <Trophy className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Medal
                                className={`h-4 w-4 ${index === 1 ? 'text-slate-400' : 'text-amber-700'}`}
                              />
                            )}
                            <span>#{index + 1}</span>
                          </>
                        ) : (
                          <span className="text-base-content/70">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="font-medium text-base-content">{entry.username}</td>
                    <td className="font-semibold text-primary">{entry.total_score}</td>
                    <td className="text-success">{entry.total_correct}</td>
                    <td className="text-base-content/70">{entry.total_attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
