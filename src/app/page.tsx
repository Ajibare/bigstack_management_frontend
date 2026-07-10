'use client';
import { useEffect, useState } from 'react';
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
        <p className="text-gray-500 mt-1">Overview of all records</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="block rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <div className={`${card.color} px-4 py-4 sm:px-5 sm:py-5 text-white`}>
                {/* Icon bubble */}
                <div className={`${card.iconBg} w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                  <card.Icon size={20} className="text-white" />
                </div>
                <p className="text-xs sm:text-sm font-medium opacity-80 mb-1">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{card.value}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
