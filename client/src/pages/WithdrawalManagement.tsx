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

export default function WithdrawalManagement() {
  const [startDate, setStartDate] = useState("2025-09-25");
  const [endDate, setEndDate] = useState("2025-10-02");
  const { toast } = useToast();

  const { data: withdrawals, isLoading } = useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const getCustomerById = (customerId: string) => {
    return customers?.find((c) => c.id === customerId);
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Withdrawal Management</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-muted-foreground">*Created Date:</Label>
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
            <Label className="text-muted-foreground">Login User Name:</Label>
            <Input data-testid="input-username" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Code:</Label>
            <Input data-testid="input-code" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Status:</Label>
            <Select defaultValue="Pending">
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button data-testid="button-filter" className="px-8">Filter</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Admin</TableHead>
              <TableHead className="text-muted-foreground">Bank Details</TableHead>
              <TableHead className="text-muted-foreground">Actual Amount</TableHead>
              <TableHead className="text-muted-foreground">Updated By</TableHead>
              <TableHead className="text-muted-foreground">Setting</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals?.map((withdrawal) => {
              const customer = getCustomerById(withdrawal.customerId);
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
                      <div><span className="text-muted-foreground">Code:</span> {customer?.code}</div>
                      <div>{customer?.username}</div>
                      <div><span className="text-muted-foreground">Wallet Balance:</span> {customer?.walletBalance}</div>
                      <div><span className="text-muted-foreground">Phone Number:</span> {customer?.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Admin: {withdrawal.adminName}</div>
                      <div>By: {withdrawal.createdBy} Recommend</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div><span className="text-muted-foreground">Withdrawal Amount:</span> {withdrawal.amount}</div>
                      <div><span className="text-muted-foreground">Bank Name:</span> {withdrawal.bankName}</div>
                      <div><span className="text-muted-foreground">Bank Account Holder:</span> {withdrawal.accountHolder}</div>
                      <div><span className="text-muted-foreground">IBAN:</span> {withdrawal.iban}</div>
                      <div><span className="text-muted-foreground">Contact Number:</span> {withdrawal.contactNumber}</div>
                      <div><span className="text-muted-foreground">Branch:</span> {withdrawal.branch}</div>
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
                        Approve
                      </Button>
                      <Button
                        data-testid={`button-reject-${withdrawal.id}`}
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
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
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
            1-{withdrawals?.length} of {withdrawals?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
