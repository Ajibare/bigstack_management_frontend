import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { SidebarProvider } from '@/components/SidebarContext';
import SplashScreen from '@/components/SplashScreen';

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BigStack Management',
  description: 'Student & Finance Management System',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen overflow-hidden bg-gray-50 font-sans antialiased">
        <SplashScreen />
        <div className="flex min-h-screen w-full overflow-hidden">
          <SidebarProvider>
            <Sidebar />

            <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
