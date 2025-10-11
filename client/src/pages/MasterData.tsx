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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const allCheckIns = checkInsResponse?.data || [];
  
  // Apply pagination
  const totalPages = Math.ceil(allCheckIns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const checkIns = allCheckIns.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <select 
              className="w-20 text-sm border rounded px-1"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} 
              ({allCheckIns.length} total check-ins)
            </div>
            
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`w-8 h-8 p-0 text-xs rounded ${
                        currentPage === pageNum 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <button
                      className={`w-8 h-8 p-0 text-xs rounded ${
                        currentPage === totalPages 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200 disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
