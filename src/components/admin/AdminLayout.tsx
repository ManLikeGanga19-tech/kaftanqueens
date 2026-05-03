import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Percent,
  FileText,
  Ruler,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutDashboard, href: '/admin' },
  { label: 'Products',   icon: Package,         href: '/admin/products' },
  { label: 'Categories', icon: Tag,             href: '/admin/categories' },
  { label: 'Orders',     icon: ShoppingBag,     href: '/admin/orders' },
  { label: 'Discounts',  icon: Percent,         href: '/admin/discounts' },
  { label: 'Policies',   icon: FileText,        href: '/admin/policies' },
  { label: 'Size Guide', icon: Ruler,           href: '/admin/size-guide' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out.');
    navigate('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link
          to="/admin"
          onClick={() => setSidebarOpen(false)}
          className="block"
        >
          <p className="font-serif text-lg text-brand-secondary leading-tight tracking-tight">
            KAFTAN QUEENS
          </p>
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-accent mt-0.5">
            Admin
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors text-[10px] uppercase tracking-widest font-bold ${
              isActive(href)
                ? 'bg-brand-accent text-brand-primary'
                : 'text-brand-secondary/60 hover:text-brand-secondary hover:bg-white/10'
            }`}
          >
            <Icon size={15} className="shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom user + logout */}
      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        {user && (
          <p className="px-3 text-[9px] uppercase tracking-widest font-bold text-brand-secondary/30 truncate">
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-brand-secondary/50 hover:text-brand-secondary hover:bg-white/10 transition-colors"
        >
          <LogOut size={15} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-brand-secondary overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-brand-primary flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-56 bg-brand-primary flex flex-col z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-brand-secondary/50 hover:text-brand-secondary"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-4 px-4 h-14 bg-brand-primary border-b border-white/10 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-brand-secondary/70 hover:text-brand-secondary"
          >
            <Menu size={22} />
          </button>
          <p className="font-serif text-brand-secondary text-base tracking-tight flex-1">
            KAFTAN QUEENS
          </p>
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-accent">
            Admin
          </p>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
