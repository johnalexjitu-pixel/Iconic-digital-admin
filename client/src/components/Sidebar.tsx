import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Banknote,
  UserCog,
  Database,
  Crown,
  FileCheck,
  UserPlus,
  UserCheck,
  ChevronDown,
  ChevronRight,
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
    badgeKey: "pendingWithdrawals",
  },
  { 
    href: "/user-management", 
    labelKey: "userManagement", 
    icon: UserCog,
    badgeKey: "pendingUsers",
  },
  {
    labelKey: "adminManagement",
    icon: UserPlus,
    children: [
      { href: "/admin-create", labelKey: "adminCreate", icon: UserPlus },
      { href: "/admin-list", labelKey: "adminList", icon: UserCheck },
    ],
  },
  { href: "/master-data", labelKey: "masterData", icon: Database },
  { href: "/vip-level", labelKey: "vipLevel", icon: Crown },
  {
    href: "/tasklist-expiration",
    labelKey: "tasklistExpiration",
    icon: FileCheck,
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Get current user info from localStorage
  const adminUser = localStorage.getItem('adminUser');
  const currentUsername = adminUser ? JSON.parse(adminUser).username : null;

  // Fetch current admin role from database
  const { data: currentAdminData } = useQuery<{
    success: boolean;
    data: {
      role: string;
      username: string;
    };
  }>({
    queryKey: ["/api/admin/current", currentUsername],
    queryFn: async () => {
      if (!currentUsername) return { success: false, data: { role: 'team', username: '' } };
      
      const response = await fetch(`/api/admin/current?username=${currentUsername}`);
      if (!response.ok) {
        throw new Error("Failed to fetch current admin info");
      }
      return response.json();
    },
    enabled: !!currentUsername,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const currentUserRole = currentAdminData?.data?.role || 'team';
  
  // Debug log to check current user role
  console.log('🔍 Current user role from database:', currentUserRole);
  console.log('🔍 Admin Management should be visible for:', currentUserRole === 'superadmin' || currentUserRole === 'admin');

  // Fetch pending counts for badges
  const { data: pendingCounts } = useQuery<{
    success: boolean;
    data: {
      pendingWithdrawals: number;
      pendingUsers: number;
    };
  }>({
    queryKey: ["/api/frontend/pending-counts"],
    queryFn: async () => {
      const response = await fetch("/api/frontend/pending-counts");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus(prev => 
      prev.includes(labelKey) 
        ? prev.filter(key => key !== labelKey)
        : [...prev, labelKey]
    );
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    // Hide Admin Management completely for team role
    if (item.labelKey === 'adminManagement' && currentUserRole === 'team') {
      return false;
    }
    return true;
  }).map(item => {
    if (item.labelKey === 'adminManagement' && 'children' in item && item.children) {
      // Filter admin management children based on role
      const filteredChildren = item.children.filter(child => {
        if (child.labelKey === 'adminCreate') {
          // Only superadmin and admin can create admins
          return currentUserRole === 'superadmin' || currentUserRole === 'admin';
        }
        if (child.labelKey === 'adminList') {
          // Only superadmin and admin can view admin list
          return currentUserRole === 'superadmin' || currentUserRole === 'admin';
        }
        return true;
      });
      
      // Only return the item if it has children after filtering
      if (filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren
        };
      } else {
        // If no children remain, hide the parent item
        return null;
      }
    }
    return item;
  }).filter(item => item !== null);

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-card border-r border-border flex flex-col pt-2 px-4 pb-4 transition-all duration-300`}>

      {/* Header */}
      {isOpen && (
        <div className="pb-4 mb-4 border-b border-border">
          <h1 className="text-base font-semibold text-foreground">
            Account Backoffice
          </h1>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = 'children' in item && item.children;
          const isExpanded = expandedMenus.includes(item.labelKey);
          const isActive = item.href ? location === item.href : 
            (hasChildren && item.children?.some(child => location === child.href));

          if (hasChildren) {
            return (
              <div key={item.labelKey} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.labelKey)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer border",
                    isActive
                      ? "bg-accent text-primary font-medium border-primary/50"
                      : "text-muted-foreground border-transparent hover:bg-accent/50 hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 truncate text-left">{t(item.labelKey)}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
                
                {isOpen && isExpanded && (
                  <div className="ml-6 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location === child.href;
                      
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          data-testid={`link-nav-${child.labelKey
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer border",
                            isChildActive
                              ? "bg-accent text-primary font-medium border-primary/50"
                              : "text-muted-foreground border-transparent hover:bg-accent/50 hover:border-border"
                          )}
                        >
                          <ChildIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1 truncate">{t(child.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
              {isOpen && (
                <>
                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                  {item.badgeKey && pendingCounts?.data && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                      {pendingCounts.data[item.badgeKey as keyof typeof pendingCounts.data] || 0}
                    </span>
                  )}
                  {'badge' in item && item.badge && (
                    <span className="bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded">
                      {String(item.badge)}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
