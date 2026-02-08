import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Fish,
  Target,
  Trophy,
  UserRound,
  Settings,
  BarChart3,
  Users,
  ListChecks,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '../../types';
import type { UserRole } from '../../lib/types';
import BrandMark from '../branding/BrandMark';
import ThemeToggle from '../ui/ThemeToggle';

type NavItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
};

type AppShellProps = {
  readonly user: User;
  readonly onLogout: () => void;
  readonly children: ReactNode;
};

const navItems: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: Fish, end: true },
  { to: '/scenarios', label: 'Scenarios', icon: Target },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, end: true },
  { to: '/profile', label: 'Profile', icon: UserRound, end: true },
  { to: '/settings', label: 'Settings', icon: Settings, end: true },
] as const;

const adminNavItems: readonly NavItem[] = [
  { to: '/admin', label: 'Admin Analytics', icon: BarChart3, end: true },
  { to: '/admin/scenarios', label: 'Manage Scenarios', icon: ListChecks, end: true },
  { to: '/admin/users', label: 'Manage Users', icon: Users, end: true },
] as const;

function NavItemLink({ item }: { readonly item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
            : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'
        }`
      }
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

function NavSection({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly NavItem[];
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-widest text-base-content/40">
        {title}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <NavItemLink key={item.to} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function AppShell({ user, onLogout, children }: AppShellProps) {
  const isAdmin = (role: string): role is Extract<UserRole, 'admin'> => role === 'admin';

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen flex-col bg-base-100">
        <header className="border-b border-base-200 bg-base-100">
          <div className="flex h-16 items-center justify-between gap-4 px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <label htmlFor="app-drawer" className="btn btn-ghost btn-square btn-sm">
                <Menu className="h-5 w-5" />
              </label>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3">
              <ThemeToggle />
              <div className="divider divider-horizontal m-0 h-6 w-px" />
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-base-content">{user.username}</p>
                  <p className="text-xs text-base-content/50">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="btn btn-ghost btn-square btn-sm"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            <div className="mx-auto w-full max-w-6xl space-y-8">{children}</div>
          </div>
        </main>
      </div>

      <div className="drawer-side">
        <label htmlFor="app-drawer" className="drawer-overlay" />
        <aside className="min-h-full w-72 border-r border-base-200 bg-base-100 overflow-y-auto">
          <div className="flex flex-col gap-8 px-5 py-6">
            <div className="flex items-center justify-between">
              <BrandMark />
              <label htmlFor="app-drawer" className="btn btn-ghost btn-square btn-sm lg:hidden">
                <X className="h-5 w-5" />
              </label>
            </div>

            <nav className="flex flex-col gap-6">
              <NavSection title="Main" items={navItems} />
              {isAdmin(user.role) && <NavSection title="Admin" items={adminNavItems} />}
            </nav>

            <div className="mt-auto space-y-3 border-t border-base-200 pt-6">
              <Link to="/scenarios" className="btn btn-primary btn-sm w-full">
                Start Scenario
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
