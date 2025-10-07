import { useQuery, useMutation } from "@tanstack/react-query";
import { type DailyCheckIn } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function MasterData() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Fetch from MongoDB
  const { data: checkInsResponse, isLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/daily-check-ins"],
    queryFn: async () => {
      const response = await fetch("/api/frontend/daily-check-ins");
      return response.json();
    }
  });

  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const updateCheckInMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await fetch(`/api/frontend/daily-check-ins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, updatedBy: "TEAM 1 - RUPEE" })
      });
      if (!response.ok) throw new Error("Failed to update check-in");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/daily-check-ins"] });
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

  const checkIns = checkInsResponse?.data || [];

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

  const handleUpdate = (checkIn: any) => {
    const checkInId = checkIn._id || checkIn.id;
    const newAmount = amounts[checkInId];
    if (newAmount && !isNaN(parseInt(newAmount))) {
      updateCheckInMutation.mutate({ id: checkInId, amount: parseInt(newAmount) });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('masterData')}</h2>
          <Button data-testid="button-daily-check-in">{t('dailyCheckIn')}</Button>
        </div>

        <div className="space-y-4">
          {checkIns?.map((checkIn: any) => {
            const checkInId = checkIn._id || checkIn.id;
            const updatedDate = checkIn.updatedAt ? new Date(checkIn.updatedAt).toLocaleString() : 'N/A';
            
            return (
              <div
                key={checkInId}
                data-testid={`row-checkin-${checkInId}`}
                className="flex items-center justify-between py-4 border-b border-border"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{checkIn.dayNumber}</div>
                  <div className="text-xs text-muted-foreground">{t('by')}:{checkIn.updatedBy}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('updated')} {updatedDate}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <div data-testid={`text-amount-${checkInId}`} className="text-lg font-semibold">
                    {checkIn.amount}
                  </div>
                </div>
                <div className="flex-1 flex justify-center">
                  <Input
                    data-testid={`input-amount-${checkInId}`}
                    type="number"
                    className="w-48"
                    placeholder={checkIn.amount.toString()}
                    value={amounts[checkInId] || ""}
                    onChange={(e) => handleAmountChange(checkInId, e.target.value)}
                  />
                </div>
                <div className="flex-1 flex justify-end">
                  <Button
                    data-testid={`button-update-${checkInId}`}
                    onClick={() => handleUpdate(checkIn)}
                    disabled={updateCheckInMutation.isPending}
                  >
                    {t('confirmUpdateAmount')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
