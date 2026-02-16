import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../contexts/AxiosContext';
import type { User } from '../../types';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import { ActiveBadge } from '../../components/ui/Badges';

export default function AdminUsersPage() {
  const api = useApi();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleUpdating, setRoleUpdating] = useState<Set<string>>(new Set());
  const [statusUpdating, setStatusUpdating] = useState<Set<string>>(new Set());

  const fetchUsers = () => {
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const toggleStatus = async (id: string, username: string) => {
    setStatusUpdating((prev) => new Set(prev).add(id));
    try {
      await api.patch(`/admin/users/${id}/toggle-status`);
      toast.success(`${username} status updated.`);
      fetchUsers();
    } catch {
      toast.error(`Could not update ${username}.`);
    } finally {
      setStatusUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const updateRole = async (id: string, role: string, username: string) => {
    setRoleUpdating((prev) => new Set(prev).add(id));
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      toast.success(`${username} is now ${role}.`);
      fetchUsers();
    } catch {
      toast.error(`Could not update ${username}.`);
    } finally {
      setRoleUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => user.username.toLowerCase().includes(normalized));
  }, [query, users]);

  if (loading) {
    return <LoadingState label="Loading users" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage Users"
        description="Update access, roles, and account status."
        icon={Users}
      />

      <SectionCard>
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-sm font-medium text-base-content">All users</h1>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search username"
            className="input input-bordered input-sm w-full sm:w-72"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium text-base-content">{user.username}</td>
                  <td className="text-base-content/70">{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value, user.username)}
                      className="select select-bordered select-sm"
                      disabled={roleUpdating.has(user.id)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <ActiveBadge isActive={user.is_active} />
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(user.id, user.username)}
                      className={`btn btn-xs ${user.is_active ? 'btn-outline btn-error' : 'btn-outline btn-success'}`}
                      disabled={statusUpdating.has(user.id)}
                    >
                      {statusUpdating.has(user.id)
                        ? 'Updating...'
                        : user.is_active
                          ? 'Deactivate'
                          : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
