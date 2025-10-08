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
  const [startDate, setStartDate] = useState("2025-09-25");
  const [endDate, setEndDate] = useState("2025-10-02");
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    username: "",
    code: "",
    status: "all"
  });
  const [isFiltered, setIsFiltered] = useState(false);

  // Fetch withdrawals from MongoDB withdrawals collection
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
    queryKey: ["/api/frontend/withdrawals"],
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
  // Filter functions - TaskManagement style
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
    } else if (field === 'endDate') {
      setEndDate(value);
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleApplyFilter = () => {
    setIsFiltered(true);
    toast({
      title: "Success",
      description: "Filters applied successfully",
    });
  };

  const handleClearFilters = () => {
    setFilters({
      username: "",
      code: "",
      status: "all"
    });
    setStartDate("2025-09-25");
    setEndDate("2025-10-02");
    setIsFiltered(false);
    toast({
      title: "Success",
      description: "Filters cleared successfully",
    });
  };

  // Use withdrawals data directly from the new API
  let displayWithdrawals = withdrawalsResponse?.data?.map((withdrawal: any) => {
    return {
      id: withdrawal._id,
      customerId: withdrawal.customerId,
      amount: withdrawal.amount?.toString() || "0",
      status: withdrawal.status === "completed" ? "Approved" : 
              withdrawal.status === "processing" ? "Processing" : "Pending",
      bankName: withdrawal.accountDetails?.provider || "N/A",
      accountHolder: withdrawal.accountDetails?.accountHolderName || "N/A",
      iban: withdrawal.accountDetails?.accountNumber || withdrawal.accountDetails?.mobileNumber || "N/A",
      contactNumber: withdrawal.accountDetails?.mobileNumber || "",
      branch: withdrawal.accountDetails?.branch || "N/A",
      adminName: withdrawal.processedBy || "TEAM 1 - RUPEE",
      createdBy: "System",
      createdAt: new Date(withdrawal.submittedAt || withdrawal.createdAt),
      updatedAt: new Date(withdrawal.updatedAt),
      adminNotes: withdrawal.adminNotes || "",
      processedAt: withdrawal.processedAt,
      customer: withdrawal.customer ? {
        code: withdrawal.customer.membershipId,
        username: withdrawal.customer.name,
        walletBalance: withdrawal.customer.accountBalance?.toString(),
        phoneNumber: withdrawal.customer.phoneNumber,
      } : null
    };
  }) || [];

  // Apply filters to withdrawals
  if (isFiltered && displayWithdrawals) {
    displayWithdrawals = displayWithdrawals.filter((withdrawal: any) => {
      // Filter by username
      if (filters.username && !withdrawal.customer?.username?.toLowerCase().includes(filters.username.toLowerCase())) {
        return false;
      }

      // Filter by code
      if (filters.code && !withdrawal.customer?.code?.toLowerCase().includes(filters.code.toLowerCase())) {
        return false;
      }

      // Filter by status
      if (filters.status && filters.status !== "all") {
        if (withdrawal.status !== filters.status) {
          return false;
        }
      }

      // Filter by date range
      if (startDate && endDate) {
        const withdrawalDate = new Date(withdrawal.createdAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        if (withdrawalDate < start || withdrawalDate > end) {
          return false;
        }
      }

      return true;
    });
  }

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/frontend/withdrawals/${id}/update-status`, { 
        status: status === "Approved" ? "completed" : status === "Rejected" ? "rejected" : status.toLowerCase(),
        adminNotes: `Status updated to ${status} via admin panel`,
        processedBy: "admin"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/frontend/withdrawals"] });
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

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t('withdrawalManagement')}</h2>
          <div className="text-sm text-muted-foreground">
            <div>MONGODB_URI: mongodb+srv://iconicdigital:iconicdigital@iconicdigital.t5nr2g9.mongodb.net/</div>
            <div>Total Withdrawals: {totalWithdrawals}</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*{t('createdDate')}:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('loginUserName')}:</Label>
            <Input 
              data-testid="input-username" 
              className="mt-1" 
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input 
              data-testid="input-code" 
              className="mt-1" 
              value={filters.code}
              onChange={(e) => handleFilterChange('code', e.target.value)}
              placeholder="Enter code"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('status')}:</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="Pending">{t('pending')}</SelectItem>
                <SelectItem value="Approved">{t('approved')}</SelectItem>
                <SelectItem value="Rejected">{t('rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button data-testid="button-filter" className="px-8" onClick={handleApplyFilter}>{t('filter')}</Button>
          <Button data-testid="button-clear-filter" variant="outline" className="px-8" onClick={handleClearFilters}>
            Clear Filters
          </Button>
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
            {displayWithdrawals?.map((withdrawal: any) => {
              return (
                <TableRow key={withdrawal.id} data-testid={`row-withdrawal-${withdrawal.id}`} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div><span className="text-muted-foreground">ID:</span> {withdrawal.id.substring(0, 4)}</div>
                      <div>Created at {withdrawal.createdAt?.toLocaleString() ?? 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div><span className="text-muted-foreground">{t('code')}:</span> {withdrawal.customer?.code}</div>
                      <div>{withdrawal.customer?.username}</div>
                      <div><span className="text-muted-foreground">{t('walletBalance')}:</span> {withdrawal.customer?.walletBalance}</div>
                      <div><span className="text-muted-foreground">{t('phoneNumber')}:</span> {withdrawal.customer?.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{t('admin')}: {withdrawal.adminName}</div>
                      <div>{t('by')}: {withdrawal.createdBy} {t('recommend')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div><span className="text-muted-foreground">{t('withdrawalAmount')}:</span> {withdrawal.amount}</div>
                      <div><span className="text-muted-foreground">{t('bankName')}:</span> {withdrawal.bankName}</div>
                      <div><span className="text-muted-foreground">{t('bankAccountHolder')}:</span> {withdrawal.accountHolder}</div>
                      <div><span className="text-muted-foreground">{t('iban')}:</span> {withdrawal.iban}</div>
                      <div><span className="text-muted-foreground">{t('contactNumber')}:</span> {withdrawal.contactNumber}</div>
                      <div><span className="text-muted-foreground">{t('branch')}:</span> {withdrawal.branch}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="text-red-600">{withdrawal.amount}</div>
                      <div className="text-red-600">{withdrawal.status}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      data-testid={`button-view-details-${withdrawal.id}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button
                        data-testid={`button-approve-${withdrawal.id}`}
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: "Approved" })}
                        disabled={updateWithdrawalMutation.isPending}
                      >
                        {t('approve')}
                      </Button>
                      <Button
                        data-testid={`button-reject-${withdrawal.id}`}
                        size="sm"
                        variant="destructive"
                        onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: "Rejected" })}
                        disabled={updateWithdrawalMutation.isPending}
                      >
                        {t('reject')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
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
