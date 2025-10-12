import { Menu, Settings, LogOut, KeyRound, FileText, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface DeveloperNotice {
  _id: string;
  content: string;
  visibleToRoles: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  // Fetch developer notices for current user
  const { data: noticesData } = useQuery<{
    success: boolean;
    data: DeveloperNotice[];
  }>({
    queryKey: ["/api/developer-notice/list", currentUsername],
    queryFn: async () => {
      const response = await fetch(`/api/developer-notice/list?currentUserUsername=${currentUsername}`);
      if (!response.ok) {
        throw new Error("Failed to fetch developer notices");
      }
      return response.json();
    },
    enabled: !!currentUsername,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Get admin username from localStorage
  const getAdminUsername = () => {
    const adminUserStr = localStorage.getItem("adminUser");
    if (adminUserStr) {
      try {
        const adminUser = JSON.parse(adminUserStr);
        return adminUser.username || "Admin";
      } catch {
        return "Admin";
      }
    }
    return "Admin";
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUser");
    setLocation("/login");
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "⚠️ Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "⚠️ Validation Error",
        description: "New password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "⚠️ Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get admin user from localStorage
      const adminUserStr = localStorage.getItem("adminUser");
      if (!adminUserStr) {
        toast({
          title: "❌ Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const adminUser = JSON.parse(adminUserStr);

      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: adminUser.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "✅ Success",
        description: "Password changed successfully",
      });
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          data-testid="button-menu"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Developer Notice Display */}
      {noticesData?.data && noticesData.data.length > 0 && (
        <div className="flex-1 mx-6">
          {noticesData.data.map((notice) => (
            <div
              key={notice._id}
              className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-800">{notice.content}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('language')}:</span>
          <Select 
            defaultValue={i18n.language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger data-testid="select-language" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="bangla">বাংলা</SelectItem>
              <SelectItem value="chinese">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span
          data-testid="text-team-badge"
          className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded capitalize"
        >
          {getAdminUsername()}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="button-settings-header"
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowChangePassword(true)}
              className="cursor-pointer"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password here
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowChangePassword(false);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
