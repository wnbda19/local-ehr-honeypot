import Link from "next/link";
import { Activity, CalendarDays, HeartPulse, LayoutDashboard, LockKeyhole, UsersRound } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: UsersRound },
  { href: "/admin/security", label: "Security", icon: LockKeyhole }
];

export function EhrShell({
  children,
  title,
  subtitle,
  userLabel,
  fake = false
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  userLabel?: string;
  fake?: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="grid h-10 w-10 place-items-center rounded bg-clinical-700 text-white">
            <HeartPulse size={23} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">St. Catherine</p>
            <p className="text-xs text-slate-500">Medical EHR</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={fake ? "/fake-ehr" : item.href}
                className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-clinical-50 hover:text-clinical-700"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{title}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex">
                <CalendarDays size={16} />
                Today
              </div>
              <div className="hidden items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 sm:flex">
                <Activity size={16} />
                {userLabel || "Clinical user"}
              </div>
              {!fake && (
                <form action="/api/logout" method="post">
                  <button className="rounded bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>
        </header>
        <div className="px-5 py-6">{children}</div>
      </section>
    </main>
  );
}
