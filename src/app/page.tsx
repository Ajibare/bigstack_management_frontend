'use client';
import { useEffect, useMemo, useState } from 'react';
import api, { Student, ItStudent, HubSubscription, FinanceEntry, KcpEntry, Course } from '@/lib/api';
import Link from 'next/link';
import {
  MdSchool,
  MdComputer,
  MdWifi,
  MdChildCare,
  MdMenuBook,
  MdTrendingUp,
  MdTrendingDown,
  MdAccountBalanceWallet,
  MdAssessment,
} from 'react-icons/md';
import { IconType } from 'react-icons';

interface Summary {
  students: number;
  itStudents: number;
  hubSubs: number;
  kcp: number;
  courses: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

interface CardDef {
  label: string;
  value: string | number;
  href: string;
  color: string;
  iconBg: string;
  Icon: IconType;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary>({
    students: 0,
    itStudents: 0,
    hubSubs: 0,
    kcp: 0,
    courses: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  });
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Student[]>('/students'),
      api.get<ItStudent[]>('/it-students'),
      api.get<HubSubscription[]>('/hub-subscriptions'),
      api.get<FinanceEntry[]>('/finance'),
      api.get<KcpEntry[]>('/kcp'),
      api.get<Course[]>('/courses'),
    ])
      .then(([s, it, hub, fin, kcp, courses]) => {
        const income = fin.data.reduce((acc, f) => acc + f.credit, 0);
        const expense = fin.data.reduce((acc, f) => acc + f.debit, 0);
        setFinanceEntries(fin.data);
        setSummary({
          students: s.data.length,
          itStudents: it.data.length,
          hubSubs: hub.data.length,
          kcp: kcp.data.length,
          courses: courses.data.length,
          totalIncome: income,
          totalExpense: expense,
          netBalance: income - expense,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthlyTrend = useMemo(() => {
    const months = new Map<string, { income: number; expense: number }>();

    financeEntries.forEach((entry) => {
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = months.get(key) ?? { income: 0, expense: 0 };
      current.income += entry.credit;
      current.expense += entry.debit;
      months.set(key, current);
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, values]) => ({
        label: new Date(`${key}-01`).toLocaleString('en-US', { month: 'short' }),
        income: values.income,
        expense: values.expense,
      }));
  }, [financeEntries]);

  const maxBarValue = Math.max(1, ...monthlyTrend.flatMap((item) => [item.income, item.expense]));

  const cards: CardDef[] = [
    {
      label: 'Regular Students',
      value: summary.students,
      href: '/students',
      color: 'bg-blue-600',
      iconBg: 'bg-blue-700',
      Icon: MdSchool,
    },
    {
      label: 'IT Students',
      value: summary.itStudents,
      href: '/it-students',
      color: 'bg-purple-600',
      iconBg: 'bg-purple-700',
      Icon: MdComputer,
    },
    {
      label: 'Hub Subscriptions',
      value: summary.hubSubs,
      href: '/hub-subscriptions',
      color: 'bg-teal-600',
      iconBg: 'bg-teal-700',
      Icon: MdWifi,
    },
    {
      label: 'KCP (KidsCode)',
      value: summary.kcp,
      href: '/kcp',
      color: 'bg-orange-500',
      iconBg: 'bg-orange-600',
      Icon: MdChildCare,
    },
    {
      label: 'Courses',
      value: summary.courses,
      href: '/courses',
      color: 'bg-indigo-600',
      iconBg: 'bg-indigo-700',
      Icon: MdMenuBook,
    },
    {
      label: 'Total Income',
      value: `₦${summary.totalIncome.toLocaleString()}`,
      href: '/finance',
      color: 'bg-green-600',
      iconBg: 'bg-green-700',
      Icon: MdTrendingUp,
    },
    {
      label: 'Total Expense',
      value: `₦${summary.totalExpense.toLocaleString()}`,
      href: '/finance',
      color: 'bg-red-500',
      iconBg: 'bg-red-600',
      Icon: MdTrendingDown,
    },
    {
      label: 'Net Balance',
      value: `₦${summary.netBalance.toLocaleString()}`,
      href: '/finance',
      color: summary.netBalance >= 0 ? 'bg-emerald-600' : 'bg-orange-600',
      iconBg: summary.netBalance >= 0 ? 'bg-emerald-700' : 'bg-orange-700',
      Icon: MdAccountBalanceWallet,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all records and finance activity</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="block rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className={`${card.color} px-4 py-4 sm:px-5 sm:py-5 text-white`}>
                  <div className={`${card.iconBg} w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                    <card.Icon size={20} className="text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium opacity-80 mb-1">{card.label}</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight break-words leading-tight">{card.value}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Finance trend</h2>
                  <p className="text-sm text-gray-500">Income vs expense over recent months</p>
                </div>
                <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                  <MdAssessment size={20} />
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end gap-2">
                {monthlyTrend.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-36 w-full items-end gap-1">
                      <div
                        className="flex-1 rounded-t bg-emerald-500"
                        style={{ height: `${Math.max((item.income / maxBarValue) * 100, 6)}%` }}
                      />
                      <div
                        className="flex-1 rounded-t bg-rose-500"
                        style={{ height: `${Math.max((item.expense / maxBarValue) * 100, 6)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Income</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expense</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Quick summary</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-blue-600">Records</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{summary.students + summary.itStudents + summary.hubSubs + summary.kcp + summary.courses}</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-green-600">Finance health</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{summary.netBalance >= 0 ? 'Positive' : 'Needs attention'}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-600">Top focus</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{summary.totalExpense > summary.totalIncome ? 'Control expenses' : 'Grow income'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
