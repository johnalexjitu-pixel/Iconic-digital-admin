import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { type Withdrawal, type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WithdrawalManagement() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-31");
  const [dateRangePreset, setDateRangePreset] = useState("custom");
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    username: "",
    code: "",
    status: "all"
  });

  // DATE RANGE FUNCTIONALITY COMPLETELY REMOVED

  // Build query parameters for API call - NO FILTERING AT ALL
  const queryParams = new URLSearchParams();
  queryParams.append("limit", "100");
  
  // ALL FILTERING REMOVED - SHOW ALL DATA ALWAYS

  // Fetch withdrawals from MongoDB withdrawals collection - using /api/withdrawals endpoint
  const { data: withdrawalsResponse, isLoading: withdrawalsLoading } = useQuery<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>({
    queryKey: [`/api/withdrawals?${queryParams.toString()}&_t=${Date.now()}`],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    cacheTime: 0, // Don't cache at all
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch users from MongoDB for customer details
  const { data: usersResponse } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/users"],
  });

  // Apply filters
  // ALL FILTER FUNCTIONS REMOVED - NO FILTERING

  // SIMPLIFIED DATA MAPPING - DIRECT FROM API
  let displayWithdrawals = [];
  
  if (withdrawalsResponse?.data && Array.isArray(withdrawalsResponse.data)) {
    console.log("🔍 Raw API data:", withdrawalsResponse.data);
    displayWithdrawals = withdrawalsResponse.data.map((withdrawal: any, index: number) => {
      console.log(`🔍 Processing withdrawal ${index + 1}:`, withdrawal);
      return {
        id: withdrawal._id || `withdrawal-${index}`,
        customerId: withdrawal.customerId || "N/A",
        amount: withdrawal.amount?.toString() || "0",
        status: withdrawal.status || "pending",
        bankName: withdrawal.accountDetails?.provider || "N/A",
        accountHolder: withdrawal.accountDetails?.accountHolderName || "N/A",
        iban: withdrawal.accountDetails?.accountNumber || withdrawal.accountDetails?.mobileNumber || "N/A",
        contactNumber: withdrawal.accountDetails?.mobileNumber || "",
        branch: withdrawal.accountDetails?.branch || "N/A",
        adminName: withdrawal.processedBy || "TEAM 1 - RUPEE",
        createdBy: "System",
        createdAt: withdrawal.submittedAt ? new Date(withdrawal.submittedAt) : new Date(),
        updatedAt: withdrawal.updatedAt ? new Date(withdrawal.updatedAt) : new Date(),
        adminNotes: withdrawal.adminNotes || "",
        processedAt: withdrawal.processedAt,
        customer: withdrawal.customer ? {
          code: withdrawal.customer.membershipId || "N/A",
          username: withdrawal.customer.name || "N/A",
          walletBalance: withdrawal.customer.accountBalance?.toString() || "0",
          phoneNumber: withdrawal.customer.phoneNumber || "N/A",
        } : {
          code: "N/A",
          username: "N/A", 
          walletBalance: "0",
          phoneNumber: "N/A"
        }
      };
    });
  } else {
    console.log("❌ No data or invalid data structure:", withdrawalsResponse);
  }
  
  console.log("🔍 Final displayWithdrawals:", displayWithdrawals);

  // No client-side filtering needed - server handles all filtering

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/frontend/withdrawals/${id}/update-status`, { 
        status: status === "Approved" ? "completed" : status === "Rejected" ? "rejected" : status.toLowerCase(),
        adminNotes: `Status updated to ${status} via admin panel`,
        processedBy: "admin"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      toast({
        title: "Success",
        description: "Withdrawal status updated successfully",
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

  if (withdrawalsLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // Get total withdrawals count for display
  const totalWithdrawals = withdrawalsResponse?.pagination?.total || 0;
  
  // Debug logging
  console.log("🔍 Withdrawal Management Debug:");
  console.log("  - withdrawalsLoading:", withdrawalsLoading);
  console.log("  - withdrawalsResponse:", withdrawalsResponse);
  console.log("  - displayWithdrawals length:", displayWithdrawals?.length || 0);
  console.log("  - totalWithdrawals:", totalWithdrawals);
  console.log("  - queryParams:", queryParams.toString());
  console.log("  - NO FILTERING - SHOWING ALL DATA");

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('withdrawalManagement')}</h2>
          <div className="text-sm text-muted-foreground">
            <div>MONGODB_URI: mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/</div>
            <div>Total Withdrawals: {totalWithdrawals}</div>
            <div>Last Updated: {new Date().toLocaleString()}</div>
            <div>Production Fix Applied - v8.0 (DEEP FIX - SIMPLIFIED RENDERING)</div>
            <div>Debug: {JSON.stringify({queryParams: queryParams.toString()})}</div>
            <div>🚫 ALL FILTERING REMOVED - Showing all withdrawal data always</div>
            <div>🔄 CACHE PREVENTION ENABLED - Fresh data every time</div>
            <div>🔍 SIMPLIFIED DATA MAPPING - Direct from API response</div>
            <div>📊 Data Status: {withdrawalsResponse ? `Received ${withdrawalsResponse.data?.length || 0} items` : 'No response'}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-center text-lg font-semibold text-green-600">
            ✅ All Withdrawal Data Displayed - No Filtering Applied
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">{t('date')}</TableHead>
              <TableHead className="text-muted-foreground">{t('customer')}</TableHead>
              <TableHead className="text-muted-foreground">{t('admin')}</TableHead>
              <TableHead className="text-muted-foreground">{t('bankDetails')}</TableHead>
              <TableHead className="text-muted-foreground">{t('actualAmount')}</TableHead>
              <TableHead className="text-muted-foreground">{t('updatedBy')}</TableHead>
              <TableHead className="text-muted-foreground">{t('setting')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayWithdrawals && displayWithdrawals.length > 0 ? (
              displayWithdrawals.map((withdrawal: any, index: number) => {
                console.log(`🔍 Rendering withdrawal ${index + 1}:`, withdrawal);
                return (
                  <TableRow key={withdrawal.id || index} data-testid={`row-withdrawal-${withdrawal.id}`} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">ID:</span> {withdrawal.id?.substring(0, 8) || 'N/A'}</div>
                        <div>Created: {withdrawal.createdAt?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">Code:</span> {withdrawal.customer?.code || 'N/A'}</div>
                        <div>Name: {withdrawal.customer?.username || 'N/A'}</div>
                        <div><span className="text-muted-foreground">Balance:</span> {withdrawal.customer?.walletBalance || '0'}</div>
                        <div><span className="text-muted-foreground">Phone:</span> {withdrawal.customer?.phoneNumber || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Admin: {withdrawal.adminName || 'N/A'}</div>
                        <div>By: {withdrawal.createdBy || 'System'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">Amount:</span> {withdrawal.amount || '0'}</div>
                        <div><span className="text-muted-foreground">Bank:</span> {withdrawal.bankName || 'N/A'}</div>
                        <div><span className="text-muted-foreground">Holder:</span> {withdrawal.accountHolder || 'N/A'}</div>
                        <div><span className="text-muted-foreground">Account:</span> {withdrawal.iban || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="text-red-600 font-bold">{withdrawal.amount || '0'}</div>
                        <div className={`font-bold ${
                          withdrawal.status === 'completed' ? 'text-green-600' : 
                          withdrawal.status === 'rejected' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {withdrawal.status?.toUpperCase() || 'PENDING'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button className="text-blue-600 hover:text-blue-800">
                        <FileText className="w-5 h-5" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: "Approved" })}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: "Rejected" })}
                          disabled={updateWithdrawalMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-lg font-semibold text-gray-500">
                    {withdrawalsLoading ? "Loading withdrawals..." : "No withdrawals found"}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    API Response: {withdrawalsResponse ? "Data received" : "No response"}
                  </div>
                  <div className="text-sm text-gray-400">
                    Data Count: {withdrawalsResponse?.data?.length || 0}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('rowsPerPage')}:</span>
            <Select defaultValue="100">
              <SelectTrigger data-testid="select-rows-per-page" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{displayWithdrawals?.length || 0} of {totalWithdrawals}
          </div>
        </div>
      </div>
    </div>
  );
}
