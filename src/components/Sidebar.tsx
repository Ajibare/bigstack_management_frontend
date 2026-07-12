'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  MdDashboard, MdSchool, MdComputer, MdWifi,
  MdAccountBalance, MdChildCare, MdMenuBook, MdClose, MdPeople,
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { useSidebar } from './SidebarContext';
import logo from './asset/logo.png';
import { useState } from 'react';

const links: { href: string; label: string; Icon: IconType }[] = [
  { href: '/',                  label: 'Dashboard',         Icon: MdDashboard      },
  { href: '/students',          label: 'Regular Students',  Icon: MdSchool         },
  { href: '/it-students',       label: 'IT Students',       Icon: MdComputer       },
  { href: '/hub-subscriptions', label: 'Hub Subscriptions', Icon: MdWifi           },
  { href: '/finance',           label: 'Finance',           Icon: MdAccountBalance },
  {href: '/kcp',               label: 'KCP',               Icon: MdChildCare      },
  { href: '/staff',             label: 'Staff',             Icon: MdPeople         },
  { href: '/courses',           label: 'Courses',           Icon: MdMenuBook       },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, close } = useSidebar();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleNavigation = (href: string) => {
    setLoadingHref(href);
    router.push(href);
    // Reset loading state after navigation (timeout as fallback)
    setTimeout(() => setLoadingHref(null), 1000);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={close} aria-hidden="true" />
      )}

      {/* Loading overlay for mobile */}
      {loadingHref && (
        <div className="fixed inset-0 z-50 bg-white/80 flex items-center justify-center lg:hidden">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      )}

      <aside className={`
        fixed top-0 left-0 z-30 h-full bg-slate-900 text-white flex flex-col
        transition-transform duration-300 ease-in-out w-60
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:z-auto lg:h-auto lg:min-h-screen lg:shrink-0
        lg:translate-x-0
        ${open ? 'lg:w-60' : 'lg:w-0 lg:overflow-hidden'}
      `}>

        {/* Logo header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
              <Image src={logo} alt="BigStack logo" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">BigStack</h1>
              <p className="text-[10px] text-slate-400 leading-tight">Management System</p>
            </div>
          </div>
          <button onClick={close} className="lg:hidden text-slate-400 hover:text-white p-1 rounded" aria-label="Close sidebar">
            <MdClose size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => {
                  handleNavigation(href);
                  // Close sidebar on mobile only
                  if (window.innerWidth < 1024) close();
                }}
                disabled={!!loadingHref}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-slate-700 text-white font-semibold border-r-4 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${loadingHref ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingHref === href ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white shrink-0"></div>
                ) : (
                  <Icon size={18} className="shrink-0" />
                )}
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-slate-700 text-[11px] text-slate-500 shrink-0">
          © 2026 BigStack
        </div>
      </aside>
    </>
  );
}
