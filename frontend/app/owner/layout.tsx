import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
