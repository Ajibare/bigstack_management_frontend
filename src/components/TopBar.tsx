'use client';
import { usePathname } from 'next/navigation';
import { MdMenu } from 'react-icons/md';
import { useSidebar } from './SidebarContext';

const titles: Record<string, string> = {
  '/':                  'Dashboard',
  '/students':          'Regular Students',
  '/it-students':       'IT Students',
  '/hub-subscriptions': 'Hub Subscriptions',
  '/finance':           'Finance',
  '/kcp':               'KCP — KidsCode Program',
  '/courses':           'Courses',
};

export default function TopBar() {
  const { toggle } = useSidebar();
  const pathname = usePathname();
  const title = titles[pathname] ?? 'BigStack Management';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm">
      {/* Page title */}
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</h2>

      {/* Hamburger — RIGHT side */}
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <MdMenu size={24} />
      </button>
    </header>
  );
}
