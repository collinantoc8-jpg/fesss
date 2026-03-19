import { ReactNode } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { 
  Home, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings 
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-primary text-primary-foreground shadow-2xl z-50">
        <div className="p-6 flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 object-contain invert brightness-0" />
          <h1 className="text-xl font-display font-bold leading-tight text-white">University<br/>Evaluations</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem href="/" icon={<Home size={20} />} label="Dashboard" />
          <NavItem href="/faculty" icon={<Users size={20} />} label="Faculty Directory" />
          <NavItem href="/evaluate" icon={<ClipboardList size={20} />} label="Evaluate" />
          <NavItem href="/results" icon={<BarChart3 size={20} />} label="Results" />
        </nav>
        
        <div className="p-4">
          <NavItem href="/admin" icon={<Settings size={20} />} label="Administration" />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden bg-primary text-white p-4 flex items-center justify-center shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 object-contain invert brightness-0" />
          <h1 className="text-lg font-display font-bold">Faculty Evals</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 w-full relative">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex justify-around p-2 pb-safe">
        <MobileNavItem href="/" icon={<Home size={22} />} label="Home" />
        <MobileNavItem href="/faculty" icon={<Users size={22} />} label="Faculty" />
        <MobileNavItem href="/evaluate" icon={<ClipboardList size={22} />} label="Evaluate" />
        <MobileNavItem href="/results" icon={<BarChart3 size={22} />} label="Results" />
        <MobileNavItem href="/admin" icon={<Settings size={22} />} label="Admin" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const [isActive] = useRoute(href);
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? "bg-white/15 text-white font-medium shadow-sm" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  const [isActive] = useRoute(href);
  
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-full py-2 gap-1 rounded-xl transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <div className={`${isActive ? "bg-primary/10 p-1.5 rounded-full" : "p-1.5"}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
