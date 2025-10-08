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

  const { data: withdrawals, isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch transactions from MongoDB (as withdrawals)
  const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/transactions"],
  });

  // Fetch users from MongoDB
  const { data: usersResponse } = useQuery<{
    success: boolean;
    data: any[];
  }>({
    queryKey: ["/api/frontend/users"],
  });

  // Apply filters
  const handleFilter = () => {
    setIsFiltered(true);
  };

  const handleResetFilter = () => {
    setFilters({
      username: "",
      code: "",
      status: "all"
    });
    setStartDate("2025-09-25");
    setEndDate("2025-10-02");
    setIsFiltered(false);
  };

  // Convert transactions to withdrawals format
  let displayWithdrawals = transactionsResponse?.data?.map((transaction: any) => {
    const user = usersResponse?.data?.find((u: any) => u._id === transaction.userId);
    return {
      id: transaction._id,
      customerId: transaction.userId,
      amount: transaction.amount?.toString() || "0",
      status: transaction.status === "completed" ? "Approved" : "Pending",
      bankName: user?.withdrawalInfo?.bankName || "N/A",
      accountHolder: user?.withdrawalInfo?.accountHolderName || "N/A",
      iban: user?.withdrawalInfo?.accountNumber || "N/A",
      contactNumber: user?.phoneNumber || "",
      branch: user?.withdrawalInfo?.branch || "N/A",
      adminName: "TEAM 1 - RUPEE",
      createdBy: "ooo001",
      createdAt: new Date(transaction.createdAt),
      updatedAt: new Date(transaction.updatedAt),
      customer: {
        code: user?.membershipId,
        username: user?.name,
        walletBalance: user?.accountBalance?.toString(),
        phoneNumber: user?.phoneNumber,
      }
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
      return apiRequest("PATCH", `/api/withdrawals/${id}`, { status });
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

  if (isLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">{t('withdrawalManagement')}</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*{t('createdDate')}:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="flex items-center">-</span>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('loginUserName')}:</Label>
            <Input 
              data-testid="input-username" 
              className="mt-1" 
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('code')}:</Label>
            <Input 
              data-testid="input-code" 
              className="mt-1" 
              value={filters.code}
              onChange={(e) => setFilters({ ...filters, code: e.target.value })}
              placeholder="Enter code"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">{t('status')}:</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
          <Button data-testid="button-filter" className="px-8" onClick={handleFilter}>{t('filter')}</Button>
          {isFiltered && (
            <Button data-testid="button-reset-filter" variant="outline" className="px-8" onClick={handleResetFilter}>
              Reset Filter
            </Button>
          )}
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
            1-{displayWithdrawals?.length} of {displayWithdrawals?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
