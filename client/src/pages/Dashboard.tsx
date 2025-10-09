import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { type Stats } from "@shared/schema";
import { useTranslation } from "react-i18next";

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

export default function Dashboard() {
  const { t } = useTranslation();
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
    </div>
  );
}
