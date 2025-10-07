import { Link, useLocation } from "wouter";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Banknote,
  UserCog,
  Database,
  Crown,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const navItems = [
  { href: "/", labelKey: "dashboard", icon: LayoutGrid },
  { href: "/customer-management", labelKey: "customerManagement", icon: Users },
  { href: "/task-management", labelKey: "taskManagement", icon: ClipboardList },
  {
    href: "/withdrawal-management",
    labelKey: "withdrawalManagement",
    icon: Banknote,
    badge: 342,
  },
  { href: "/user-management", labelKey: "userManagement", icon: UserCog },
  { href: "/master-data", labelKey: "masterData", icon: Database },
  { href: "/vip-level", labelKey: "vipLevel", icon: Crown },
  {
    href: "/tasklist-expiration",
    labelKey: "tasklistExpiration",
    icon: FileCheck,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col pt-2 px-4 pb-4">

      {/* Header */}
      <div className="pb-4 mb-4 border-b border-border">
        <h1 className="text-base font-semibold text-foreground">
          Account Backoffice
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`link-nav-${item.labelKey
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer border",
                isActive
                  ? "bg-accent text-primary font-medium border-primary/50"
                  : "text-muted-foreground border-transparent hover:bg-accent/50 hover:border-border"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{t(item.labelKey)}</span>
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
