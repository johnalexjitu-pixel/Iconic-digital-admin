import { useQuery } from "@tanstack/react-query";
import { type VipLevel } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VIPLevel() {
  const { data: vipLevels, isLoading } = useQuery<VipLevel[]>({
    queryKey: ["/api/vip-levels"],
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
      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-muted-foreground">VIP Level</TableHead>
              <TableHead className="text-muted-foreground">Task</TableHead>
              <TableHead className="text-muted-foreground">Withdrawal Limitation</TableHead>
              <TableHead className="text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vipLevels?.map((level) => (
              <TableRow key={level.id} data-testid={`row-vip-${level.id}`} className="hover:bg-muted/50">
                <TableCell className="px-6 py-6">
                  <div className="text-lg font-semibold">{level.name}</div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="text-sm space-y-1">
                    <div>Min Amount: {level.minAmount}</div>
                    <div>Task Count: {level.taskCount}</div>
                    <div>3 Task: {level.threeTask}</div>
                    <div>Commission Percentage: {level.commissionPercentage}</div>
                    <div>Combo Commission Percentage: {level.comboCommissionPercentage}</div>
                    <div>
                      Product Range %: {level.productRangeMin}% Product Range %: {level.productRangeMax}%
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="text-sm space-y-1">
                    <div>Min Withdrawal Amount: {level.minWithdrawal}</div>
                    <div>Max Withdrawal Amount: {level.maxWithdrawal}</div>
                    <div>Completed Task/Day To Withdraw: {level.completedTasksToWithdraw}</div>
                    <div>Withdrawl Fees: {level.withdrawalFees}%</div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <Button data-testid={`button-edit-vip-${level.id}`}>Edit</Button>
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
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            1-{vipLevels?.length} of {vipLevels?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
