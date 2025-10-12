import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { type Stats } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";

interface FrontendStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalTransactions: number;
  totalEarnings: number;
  totalBalance: number;
  // Withdrawal statistics
  totalWithdrawals: number;
  approvedWithdrawals: number;
  pendingWithdrawals: number;
  rejectedWithdrawals: number;
  totalApprovedAmount: number;
  totalPendingAmount: number;
  totalRejectedAmount: number;
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

export default function Dashboard() {
  const { t } = useTranslation();

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

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  // Frontend database stats
  const { data: frontendStatsResponse, isLoading: frontendLoading } = useQuery<{
    success: boolean;
    data: FrontendStats;
  }>({
    queryKey: ["/api/frontend/dashboard-stats"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const frontendStats = frontendStatsResponse?.data;

  if (isLoading || frontendLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title={t('deposit')}
          today={0}
          yesterday={0}
          total={frontendStats?.totalBalance || 0}
          bgColor="hsl(262, 83%, 58%)"
        />
        <StatCard
          title={t('approvedWithdrawal')}
          today={0}
          yesterday={0}
          total={frontendStats?.totalApprovedAmount?.toLocaleString() || 0}
          bgColor="hsl(0, 84%, 60%)"
        />
        <StatCard
          title={t('pendingWithdrawal')}
          today={0}
          yesterday={0}
          total={frontendStats?.totalPendingAmount?.toLocaleString() || 0}
          bgColor="hsl(328, 86%, 70%)"
        />
        <StatCard
          title={t('rejectedWithdrawal')}
          today={0}
          yesterday={0}
          total={frontendStats?.totalRejectedAmount?.toLocaleString() || 0}
          bgColor="hsl(239, 84%, 67%)"
        />
        <StatCard
          title={t('customer')}
          today={0}
          yesterday={0}
          total={frontendStats?.totalUsers || 0}
          bgColor="hsl(0, 84%, 60%)"
        />
      </div>

      {/* Developer Notices Section */}
      {noticesData?.data && noticesData.data.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("developerNotices") || "Developer Notices"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {noticesData.data.map((notice) => (
                  <div
                    key={notice._id}
                    className="p-4 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-blue-800 mb-2">
                          {notice.content}
                        </div>
                        <div className="flex items-center justify-between text-xs text-blue-600">
                          <span>
                            {t("visibleTo") || "Visible to"}: {notice.visibleToRoles.map(role => t(role) || role).join(", ")}
                          </span>
                          <span>
                            {t("createdBy") || "By"}: {notice.createdBy} • {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
