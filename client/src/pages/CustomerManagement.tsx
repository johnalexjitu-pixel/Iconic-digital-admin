import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { type Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";

export default function CustomerManagement() {
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-02");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Customer Management</h2>
          <Button data-testid="button-create-customer">Create Customer</Button>
        </div>

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
            <Label className="text-muted-foreground">IP Address:</Label>
            <Input data-testid="input-ip" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Phone Number:</Label>
            <Input data-testid="input-phone" className="mt-1" />
          </div>

          <div>
            <Label className="text-muted-foreground">Customer Status:</Label>
            <Select>
              <SelectTrigger data-testid="select-status" className="mt-1">
                <SelectValue placeholder="Please select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground">Online/Offline:</Label>
            <Select defaultValue="all">
              <SelectTrigger data-testid="select-online-status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Details</TableHead>
              <TableHead className="text-muted-foreground">Account Management</TableHead>
              <TableHead className="text-muted-foreground">Bank Account Details</TableHead>
              <TableHead className="text-muted-foreground">IP</TableHead>
              <TableHead className="text-muted-foreground">Task Plan</TableHead>
              <TableHead className="text-muted-foreground">Setting</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer, index) => (
              <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`} className="hover:bg-muted/50">
                <TableCell className="text-sm">{28009 - index}</TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Code:</span> {customer.code}</div>
                    <div><span className="text-muted-foreground">UserName:</span> {customer.username}</div>
                    <div><span className="text-muted-foreground">Email:</span> {customer.email}</div>
                    <div><span className="text-muted-foreground">Actual Wallet Balance:</span> {customer.actualWalletBalance}</div>
                    <div><span className="text-muted-foreground">Wallet Balance:</span> {customer.walletBalance}</div>
                    <div><span className="text-muted-foreground">Login Password:</span> {customer.loginPassword}</div>
                    <div><span className="text-muted-foreground">Pay Password:</span> {customer.payPassword}</div>
                    <div><span className="text-muted-foreground">Phone Number:</span> {customer.phoneNumber}</div>
                    <div><span className="text-muted-foreground">Referral Code:</span> {customer.referralCode}</div>
                    <div className="text-blue-600">By: {customer.createdBy} Created</div>
                    <div><span className="text-muted-foreground">By:</span> {customer.updatedBy} Updated</div>
                    <div><span className="text-muted-foreground">Updated At:</span> {customer.updatedAt?.toLocaleString() ?? 'N/A'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Actual Account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowTask ? "text-blue-600" : ""}>
                        {customer.allowTask ? "Allow To Start Task" : "Not Allowed To Start Task"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowCompleteTask ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowCompleteTask ? "text-blue-600" : ""}>
                        {customer.allowCompleteTask ? "Allow To Complete Task" : "Not Allowed To Complete Task"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowWithdraw ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span>{customer.allowWithdraw ? "Allowed To Withdraw" : "Not Allowed To Withdraw"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {customer.allowReferral ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                      <span className={customer.allowReferral ? "text-blue-600" : ""}>
                        {customer.allowReferral ? "Allow To Use Referral Code" : "Not Allowed To Use Referral Code"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Phone Number:</span> {customer.phoneNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">IP Address:</span> {customer.ipAddress}</div>
                    <div><span className="text-muted-foreground">IP Country:</span> {customer.ipCountry}</div>
                    <div><span className="text-muted-foreground">IP Region:</span> {customer.ipRegion}</div>
                    <div><span className="text-muted-foreground">IP ISP:</span> {customer.ipISP}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Level:</span> {customer.vipLevel}</div>
                    <div><span className="text-muted-foreground">Everyday:</span> {customer.taskCount}</div>
                    <div><span className="text-muted-foreground">Today:</span> Completed: {customer.todayCompleted} Task</div>
                    <div>Completed: {customer.completedTasks}</div>
                    <div><span className="text-muted-foreground">Total Deposit:</span> $ {customer.totalDeposit}</div>
                    <div><span className="text-muted-foreground">Today Commission:</span> $ {customer.todayCommission}</div>
                    <div><span className="text-muted-foreground">Total Commission:</span> $ {customer.totalCommission}</div>
                    <div><span className="text-muted-foreground">Credit Score:</span> {customer.creditScore}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button data-testid={`button-task-${customer.id}`} size="sm" className="text-xs">Task</Button>
                    <Button data-testid={`button-combo-${customer.id}`} size="sm" className="text-xs">Combo Task</Button>
                    <Button data-testid={`button-level-${customer.id}`} size="sm" className="text-xs">Level</Button>
                    <Button data-testid={`button-edit-balance-${customer.id}`} size="sm" className="text-xs">Edit Balance</Button>
                    <Button data-testid={`button-reset-task-${customer.id}`} size="sm" className="text-xs">Reset Task</Button>
                    <Button data-testid={`button-edit-profile-${customer.id}`} size="sm" className="text-xs">Edit Profile</Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    data-testid={`button-status-${customer.id}`}
                    variant={customer.isActive ? "default" : "secondary"}
                    size="sm"
                    className={customer.isActive ? "bg-success hover:bg-success/90" : ""}
                  >
                    {customer.isActive ? "Activate" : "Deactivate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{customers?.length} of {customers?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
