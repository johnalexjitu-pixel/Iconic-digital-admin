import { Link, useLocation } from "wouter";
import { LayoutGrid, Users, ClipboardList, Banknote, UserCog, Database, Crown, FileCheck, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/customer-management", label: "Customer Management", icon: Users },
  { href: "/task-management", label: "Task Management", icon: ClipboardList },
  { href: "/withdrawal-management", label: "Withdrawal Management", icon: Banknote, badge: 342 },
  { href: "/user-management", label: "User Management", icon: UserCog },
  { href: "/master-data", label: "Master Data Management", icon: Database },
  { href: "/vip-level", label: "VIP Level Management", icon: Crown },
  { href: "/tasklist-expiration", label: "Customer Tasklist Expiration", icon: FileCheck },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-sm font-semibold text-foreground">Account Backoffice</h1>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-accent text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
