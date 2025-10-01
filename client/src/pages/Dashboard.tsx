import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { type Stats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
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
          title="Deposit"
          today={stats.depositsToday}
          yesterday={stats.depositsYesterday}
          total={stats.depositsTotal}
          bgColor="hsl(262, 83%, 58%)"
        />
        <StatCard
          title="Approved Withdrawal"
          today={stats.approvedToday}
          yesterday={stats.approvedYesterday}
          total={stats.approvedTotal}
          bgColor="hsl(0, 84%, 60%)"
        />
        <StatCard
          title="Pending Withdrawal"
          today={stats.pendingToday}
          yesterday={stats.pendingYesterday}
          total={stats.pendingTotal}
          bgColor="hsl(328, 86%, 70%)"
        />
        <StatCard
          title="Rejected Withdrawal"
          today={stats.rejectedToday}
          yesterday={stats.rejectedYesterday}
          total={stats.rejectedTotal}
          bgColor="hsl(239, 84%, 67%)"
        />
        <StatCard
          title="Customer"
          today={stats.customersToday}
          yesterday={stats.customersYesterday}
          total={stats.customersTotal}
          bgColor="hsl(0, 84%, 60%)"
        />
      </div>
    </div>
  );
}
