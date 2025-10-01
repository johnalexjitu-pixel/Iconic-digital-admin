import { useQuery, useMutation } from "@tanstack/react-query";
import { type DailyCheckIn } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function MasterData() {
  const { toast } = useToast();
  const { data: checkIns, isLoading } = useQuery<DailyCheckIn[]>({
    queryKey: ["/api/daily-check-ins"],
  });

  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const updateCheckInMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      return apiRequest("PATCH", `/api/daily-check-ins/${id}`, { amount, updatedBy: "TEAM 1 - RUPEE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-check-ins"] });
      toast({
        title: "Success",
        description: "Amount updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const handleAmountChange = (id: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (checkIn: DailyCheckIn) => {
    const newAmount = amounts[checkIn.id];
    if (newAmount && !isNaN(parseInt(newAmount))) {
      updateCheckInMutation.mutate({ id: checkIn.id, amount: parseInt(newAmount) });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Master Data Management</h2>
          <Button data-testid="button-daily-check-in">Daily Check In</Button>
        </div>

        <div className="space-y-4">
          {checkIns?.map((checkIn) => (
            <div
              key={checkIn.id}
              data-testid={`row-checkin-${checkIn.id}`}
              className="flex items-center justify-between py-4 border-b border-border"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">{checkIn.dayNumber}</div>
                <div className="text-xs text-muted-foreground">by:{checkIn.updatedBy}</div>
                <div className="text-xs text-muted-foreground">
                  Updated {checkIn.updatedAt?.toLocaleString() ?? 'N/A'}
                </div>
              </div>
              <div className="flex-1 text-center">
                <div data-testid={`text-amount-${checkIn.id}`} className="text-lg font-semibold">
                  {checkIn.amount}
                </div>
              </div>
              <div className="flex-1 flex justify-center">
                <Input
                  data-testid={`input-amount-${checkIn.id}`}
                  type="number"
                  className="w-48"
                  placeholder={checkIn.amount.toString()}
                  value={amounts[checkIn.id] || ""}
                  onChange={(e) => handleAmountChange(checkIn.id, e.target.value)}
                />
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  data-testid={`button-update-${checkIn.id}`}
                  onClick={() => handleUpdate(checkIn)}
                  disabled={updateCheckInMutation.isPending}
                >
                  Confirm Update Amount
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
